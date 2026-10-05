import { command, getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { requireViewer } from './server/viewer';
import { auth, googleConfigured } from './server/auth';
import { db } from './server/db';
import { contacts, googleImports } from './server/schema';
import { addressBook } from './server/address-book';
import { importGoogleContact, listGooglePeople } from './server/google-contacts';
import { GooglePerson, type Choice } from './google-person';

const contactsScope = 'https://www.googleapis.com/auth/contacts';
type Viewer = ReturnType<typeof requireViewer>;

export const getGoogleConnection = query(async () => {
  const viewer = requireViewer();
  if (viewer.kind === 'demo') return { status: 'demo' } as const;
  if (!googleConfigured) return { status: 'unavailable' } as const;
  const accounts = await auth.api.listUserAccounts({ headers: getRequestEvent().request.headers });
  const account = accounts.find(
    (account) => account.providerId === 'google' && account.scopes.includes(contactsScope)
  );
  if (!account) return { status: 'disconnected' } as const;
  const imports = await db
    .select({ contactId: googleImports.contactId, status: googleImports.status })
    .from(googleImports)
    .innerJoin(contacts, eq(contacts.id, googleImports.contactId))
    .where(and(eq(contacts.ownerId, viewer.id), eq(googleImports.accountId, account.accountId)));
  return { status: 'connected', imports } as const;
});

/** The connected Google account, a fresh access token, and its current contacts. */
async function connect(viewer: Viewer) {
  if (viewer.kind === 'demo' || !googleConfigured)
    return {
      ok: false,
      message: 'Sign in to an account with Google Contacts connected before exporting.'
    } as const;
  const headers = getRequestEvent().request.headers;
  const accounts = await auth.api.listUserAccounts({ headers });
  const account = accounts.find(
    (account) => account.providerId === 'google' && account.scopes.includes(contactsScope)
  );
  if (!account) return { ok: false, message: 'Connect Google Contacts before exporting.' } as const;
  let token: string;
  try {
    const result = await auth.api.getAccessToken({ headers, body: { accountId: account.id } });
    if (!result.accessToken)
      return {
        ok: false,
        message: 'Google did not return an access token. Reconnect your account.'
      } as const;
    token = result.accessToken;
  } catch {
    return {
      ok: false,
      message:
        'Google access expired and could not be renewed. Reconnect your account. Your contacts are still saved here.'
    } as const;
  }
  const listed = await listGooglePeople(token);
  if (!listed.ok) return listed;
  return { ok: true, accountId: account.accountId, token, people: listed.people } as const;
}

/** What an export would do, without writing anything, so differing details can be settled first. */
export const previewExport = command(z.array(z.string()).min(1).max(1000), async (ids) => {
  const viewer = requireViewer();
  const google = await connect(viewer);
  if (!google.ok) return google;
  const cards = (await addressBook(db).contacts(viewer.id)).filter((card) =>
    ids.includes(card.id)
  );
  let created = 0;
  const review: { contactId: string; choices: Choice[] }[] = [];
  for (const card of cards) {
    const existing = GooglePerson.match(card.data, google.people);
    if (!existing) {
      created++;
      continue;
    }
    const { choices } = GooglePerson.merge(card.data, existing);
    if (choices.length) review.push({ contactId: card.id, choices });
  }
  return { ok: true, created, merged: cards.length - created, review } as const;
});

const resolution = z.enum(['google', 'card', 'both']);

export const importToGoogle = command(
  z.object({
    ids: z.array(z.string()).min(1).max(3),
    // Per contact, how to settle each detail Google already has with a different value.
    decisions: z.record(z.string(), z.record(z.string(), resolution))
  }),
  async ({ ids, decisions }) => {
    const viewer = requireViewer();
    const google = await connect(viewer);
    if (!google.ok) return { ...google, imported: 0, merged: 0, photoSkipped: 0 } as const;
    const cards = (await addressBook(db).contacts(viewer.id)).filter((card) =>
      ids.includes(card.id)
    );
    let imported = 0;
    let merged = 0;
    let photoSkipped = 0;
    // Google requires sequential writes for the same account. Keep each serverless batch small.
    for (const card of cards) {
      const result = await importGoogleContact(db, card, {
        accountId: google.accountId,
        token: google.token,
        people: google.people,
        decisions: decisions[card.id]
      });
      if (result.status === 'failed') {
        await getGoogleConnection().refresh();
        return { ok: false, message: result.message, imported, merged, photoSkipped } as const;
      }
      if (result.status === 'skipped') continue;
      // Keep the list current so later cards in this batch match what was just written.
      const index = google.people.findIndex(
        (person) => person.resourceName === result.person.resourceName
      );
      if (index === -1) google.people.push(result.person);
      else google.people[index] = result.person;
      if (result.status === 'imported') imported++;
      else merged++;
      if (result.photoSkipped) photoSkipped++;
    }
    await getGoogleConnection().refresh();
    return { ok: true, imported, merged, photoSkipped } as const;
  }
);
