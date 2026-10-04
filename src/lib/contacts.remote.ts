import { command, getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import { error } from '@sveltejs/kit';
import { db } from './server/db';
import { addressBook } from './server/address-book';
import { requireViewer } from './server/viewer';
import { contactInput } from './contact';
import { googleConfigured } from './server/auth';
import { and, eq } from 'drizzle-orm';
import { contacts, savedCards } from './server/schema';
import { claimCookieDomain } from './server/claim-cookie';
import { normalizePhoto } from './server/photo';

const book = addressBook(db);
export const getAddressBook = query(async () => {
  const viewer = requireViewer();
  const [profile, saved, people, links] = await Promise.all([
    book.ensureProfile(viewer.id, viewer.name),
    db.query.savedCards.findFirst({ where: eq(savedCards.userId, viewer.id) }),
    book.contacts(viewer.id),
    book.openInvitations(viewer.id)
  ]);
  const savedCard = saved ? contactInput.parse(saved.data) : null;
  return { viewer, profile, contacts: people, invitations: links, googleConfigured, savedCard };
});

const OPEN_LIMIT = 200;
async function openCount(ownerId: string) {
  return (await book.openInvitations(ownerId)).filter((item) => item.expiresAt > Date.now()).length;
}

export const createInvitations = command(
  z.object({ count: z.number().int().min(1).max(20), label: z.string().trim().max(100) }),
  async ({ count, label }) => {
    const viewer = requireViewer();
    if ((await openCount(viewer.id)) + count > OPEN_LIMIT)
      return {
        ok: false,
        message: `You can have ${OPEN_LIMIT} open links. Delete ones you no longer need, then try again.`
      } as const;
    const invitations = await book.createInvitations(viewer.id, count, label);
    await getAddressBook().refresh();
    return { ok: true, invitations } as const;
  }
);

const missingLink = {
  ok: false,
  message: 'That link was already used or deleted. Refresh to see your current links.'
} as const;

export const deleteInvitation = command(z.string(), async (id) => {
  const deleted = await book.deleteInvitation(requireViewer().id, id);
  await getAddressBook().refresh();
  return deleted ? ({ ok: true } as const) : missingLink;
});

export const renewInvitation = command(z.string(), async (id) => {
  const viewer = requireViewer();
  if ((await openCount(viewer.id)) >= OPEN_LIMIT)
    return {
      ok: false,
      message: `You can have ${OPEN_LIMIT} open links. Delete ones you no longer need, then try again.`
    } as const;
  const renewed = await book.renewInvitation(viewer.id, id);
  await getAddressBook().refresh();
  return renewed ? ({ ok: true } as const) : missingLink;
});

export const renameInvitation = command(
  z.object({ id: z.string(), label: z.string().trim().max(100) }),
  async ({ id, label }) => {
    const renamed = await book.renameInvitation(requireViewer().id, id, label);
    await getAddressBook().refresh();
    return renamed ? ({ ok: true } as const) : missingLink;
  }
);

export const setFavorite = command(
  z.object({ id: z.string(), favorite: z.boolean() }),
  async ({ id, favorite }) => {
    await db
      .update(contacts)
      .set({ favorite })
      .where(and(eq(contacts.id, id), eq(contacts.ownerId, requireViewer().id)));
    await getAddressBook().refresh();
  }
);

export const deleteContact = command(z.string(), async (id) => {
  await db
    .delete(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.ownerId, requireViewer().id)));
  await getAddressBook().refresh();
});

export const saveProfile = command(
  z.object({
    name: z.string().trim().min(1).max(80),
    slug: z
      .string()
      .min(3)
      .max(40)
      .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Use lowercase letters, numbers, and hyphens.'),
    message: z.string().trim().min(1).max(500)
  }),
  async (input) => {
    const result = await book.saveProfile(requireViewer().id, input);
    await getAddressBook().refresh();
    return result;
  }
);

export const claimCard = command(async () => {
  const { cookies, locals, url } = getRequestEvent();
  if (locals.viewer?.kind !== 'account') error(401, 'Sign in to save your contact card.');
  const receipt = cookies.get('gather-claim');
  if (!receipt || !(await book.claim(receipt, locals.viewer.id)))
    return {
      ok: false,
      message:
        'No unclaimed card was found in this browser. Your original submission is still saved with your friend.'
    } as const;
  cookies.delete('gather-claim', { path: '/', domain: claimCookieDomain(url.hostname) });
  await getAddressBook().refresh();
  return { ok: true } as const;
});

export const saveMyCard = command(contactInput, async (data) => {
  const viewer = requireViewer();
  if (viewer.kind !== 'account')
    return { ok: false, message: 'Create an account to save your own card.' } as const;
  const normalized = await normalizePhoto(data.photo);
  if (!normalized.ok) return normalized;
  const card = { ...data, photo: normalized.photo };
  await db
    .insert(savedCards)
    .values({ userId: viewer.id, data: card })
    .onConflictDoUpdate({ target: savedCards.userId, set: { data: card } });
  await getAddressBook().refresh();
  return { ok: true } as const;
});
