import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { and, desc, eq, exists, gt, isNull, like, ne, sql } from 'drizzle-orm';
import { contactInput, type ContactInput } from '../contact';
import { InvitationToken } from './invitation-token';
import { invitationReference } from '../invitation-token';
import type { AppDatabase } from './db';
import { contacts, invitations, profiles, savedCards } from './schema';

export type Profile = typeof profiles.$inferSelect;
export type Invitation = Omit<typeof invitations.$inferSelect, 'tokenHash'>;
const INVITATION_LIFETIME = 30 * 86_400_000;
const hash = (token: string) => createHash('sha256').update(token).digest('hex');
const reservedSlugs = new Set([
  'www',
  'app',
  'api',
  'admin',
  'mail',
  'support',
  'help',
  'login',
  'signup',
  'static',
  'assets',
  'contacts'
]);

const pageName = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
/** The first name alone, then numbered from 2, skipping reserved and too-short names. */
function pageNames(base: string) {
  return [base, ...Array.from({ length: 998 }, (_, index) => `${base}${index + 2}`)].filter(
    (candidate) => pageName.test(candidate) && !reservedSlugs.has(candidate)
  );
}

export function addressBook(db: AppDatabase) {
  async function profile(ownerId: string) {
    return (await db.query.profiles.findFirst({ where: eq(profiles.ownerId, ownerId) })) ?? null;
  }
  async function publicProfile(slug: string) {
    return (await db.query.profiles.findFirst({ where: eq(profiles.slug, slug) })) ?? null;
  }
  async function ensureProfile(ownerId: string, name: string) {
    const existing = await profile(ownerId);
    if (existing) return existing;
    // Account names can include surnames that the owner has not chosen to publish.
    const publicName = name.trim().split(/\s+/)[0] || 'Friend';
    const base =
      publicName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 24)
        .replace(/^-+|-+$/g, '') || 'friend';
    // A UNIQUE slug arbitrates simultaneous signups; retry with the next free name.
    for (let attempt = 0; attempt < 5; attempt++) {
      const taken = new Set(
        (
          await db
            .select({ slug: profiles.slug })
            .from(profiles)
            .where(like(profiles.slug, `${base}%`))
        ).map(({ slug }) => slug)
      );
      const slug = pageNames(base).find((candidate) => !taken.has(candidate));
      if (!slug) break;
      await db
        .insert(profiles)
        .values({ ownerId, slug, name: publicName, createdAt: Date.now() })
        .onConflictDoNothing();
      const created = await profile(ownerId);
      if (created) return created;
    }
    throw new Error(
      `Could not reserve a page address starting with "${base}" after five attempts. Retry signing in.`
    );
  }
  async function listContacts(ownerId: string) {
    const rows = await db
      .select({
        contact: contacts,
        id: invitations.id,
        label: invitations.label,
        reference: invitations.reference
      })
      .from(contacts)
      .leftJoin(invitations, eq(invitations.id, contacts.invitationId))
      .where(eq(contacts.ownerId, ownerId))
      .orderBy(desc(contacts.createdAt));
    return rows.map(({ contact: { claimHash: _claimHash, ...row }, id, label, reference }) => ({
      ...row,
      data: contactInput.parse(row.data),
      // Which link produced a card, so a joke answer can be traced to a conversation.
      source:
        id === null
          ? null
          : { label: label ?? '', reference: invitationReference({ id, reference }) }
    }));
  }
  async function listInvitations(ownerId: string): Promise<Invitation[]> {
    const rows = await db
      .select()
      .from(invitations)
      .where(eq(invitations.ownerId, ownerId))
      .orderBy(desc(invitations.createdAt));
    return rows.map(({ tokenHash: _hash, ...invitation }) => invitation);
  }
  async function openInvitations(ownerId: string) {
    return (await listInvitations(ownerId)).filter(({ status }) => status === 'pending');
  }
  const ownedOpen = (ownerId: string, id: string) =>
    and(
      eq(invitations.id, id),
      eq(invitations.ownerId, ownerId),
      eq(invitations.status, 'pending')
    );
  async function deleteInvitation(ownerId: string, id: string) {
    // Used links stay because their contact references them as its source.
    const deleted = await db
      .delete(invitations)
      .where(ownedOpen(ownerId, id))
      .returning({ id: invitations.id });
    return deleted.length > 0;
  }
  async function renewInvitation(ownerId: string, id: string) {
    const renewed = await db
      .update(invitations)
      .set({ expiresAt: Date.now() + INVITATION_LIFETIME })
      .where(ownedOpen(ownerId, id))
      .returning({ id: invitations.id });
    return renewed.length > 0;
  }
  async function renameInvitation(ownerId: string, id: string, label: string) {
    const renamed = await db
      .update(invitations)
      .set({ label })
      .where(and(eq(invitations.id, id), eq(invitations.ownerId, ownerId)))
      .returning({ id: invitations.id });
    return renamed.length > 0;
  }
  async function invitationState(token: string) {
    const row = await db
      .select({ slug: profiles.slug, status: invitations.status, expiresAt: invitations.expiresAt })
      .from(invitations)
      .innerJoin(profiles, eq(profiles.ownerId, invitations.ownerId))
      .where(and(eq(invitations.tokenHash, hash(token)), ne(invitations.status, 'revoked')))
      .get();
    if (!row) return null;
    const state = row.status === 'used' ? 'used' : row.expiresAt > Date.now() ? 'open' : 'expired';
    return { slug: row.slug, state } as const;
  }
  async function createInvitations(ownerId: string, count: number, label: string) {
    const generated: (Invitation & { token: string })[] = [];
    let pending = Array.from({ length: count }, (_, index) => index);
    // A UNIQUE constraint arbitrates collisions, including simultaneous batches.
    for (let attempt = 0; generated.length < count && attempt < 5; attempt++) {
      const candidates = pending.map((index) => {
        const token = InvitationToken.generate();
        return {
          id: randomUUID(),
          ownerId,
          token,
          // A short fragment the owner can search for in their messages.
          reference: token.slice(0, 3),
          label: label ? (count > 1 ? `${label} ${index + 1}` : label) : '',
          status: 'pending' as const,
          createdAt: Date.now(),
          expiresAt: Date.now() + INVITATION_LIFETIME
        };
      });
      const inserted = await db
        .insert(invitations)
        .values(candidates.map((invite) => ({ ...invite, tokenHash: hash(invite.token) })))
        .onConflictDoNothing({ target: invitations.tokenHash })
        .returning({ id: invitations.id });
      const ids = new Set(inserted.map(({ id }) => id));
      generated.push(...candidates.filter(({ id }) => ids.has(id)));
      pending = pending.filter((_, index) => {
        const candidate = candidates[index];
        return candidate === undefined || !ids.has(candidate.id);
      });
    }
    if (generated.length !== count)
      throw new Error(
        'Could not allocate unique invitation codes after five attempts. Retry creating links.'
      );
    return generated;
  }
  async function invitationPage(token: string) {
    const result = await db
      .select({ slug: profiles.slug })
      .from(invitations)
      .innerJoin(profiles, eq(profiles.ownerId, invitations.ownerId))
      .where(eq(invitations.tokenHash, hash(token)))
      .get();
    return result?.slug ?? null;
  }
  async function invitation(token: string, slug: string) {
    const result = await db
      .select({ invitation: invitations })
      .from(invitations)
      .innerJoin(profiles, eq(profiles.ownerId, invitations.ownerId))
      .where(
        and(
          eq(invitations.tokenHash, hash(token)),
          eq(profiles.slug, slug),
          eq(invitations.status, 'pending'),
          gt(invitations.expiresAt, Date.now())
        )
      )
      .get();
    return result?.invitation ?? null;
  }
  async function submit(token: string, slug: string, input: ContactInput) {
    const parsed = contactInput.safeParse(input);
    if (!parsed.success)
      return {
        ok: false,
        message: parsed.error.issues[0]?.message || 'Check your contact details.'
      } as const;
    const owner = await publicProfile(slug);
    if (!owner) return { ok: false, message: 'This contact page is no longer available.' } as const;
    const id = randomUUID();
    const receipt = randomBytes(32).toString('base64url');
    // Turso batches are atomic. INSERT ... SELECT checks validity inside the same
    // write transaction that consumes the link, without interactive transaction locks.
    const [inserted] = await db.batch([
      db
        .insert(contacts)
        .select(
          db
            .select({
              id: sql<string>`${id}`.as('id'),
              ownerId: invitations.ownerId,
              invitationId: invitations.id,
              linkedUserId: sql<string | null>`NULL`.as('linkedUserId'),
              claimHash: sql<string>`${hash(receipt)}`.as('claimHash'),
              createdAt: sql<number>`${Date.now()}`.as('createdAt'),
              data: sql<ContactInput>`${JSON.stringify(parsed.data)}`.as('data')
            })
            .from(invitations)
            .where(
              and(
                eq(invitations.tokenHash, hash(token)),
                eq(invitations.ownerId, owner.ownerId),
                eq(invitations.status, 'pending'),
                gt(invitations.expiresAt, Date.now())
              )
            )
        )
        .returning({ id: contacts.id }),
      db
        .update(invitations)
        .set({ status: 'used' })
        .where(
          and(
            eq(invitations.tokenHash, hash(token)),
            exists(db.select({ id: contacts.id }).from(contacts).where(eq(contacts.id, id)))
          )
        )
    ]);
    if (!inserted.length)
      return {
        ok: false,
        message:
          'This invitation has already been used, expired, or was revoked. Ask your friend for a new link.'
      } as const;
    return { ok: true, receipt } as const;
  }
  async function claim(receipt: string, userId: string) {
    const eligible = and(
      eq(contacts.claimHash, hash(receipt)),
      isNull(contacts.linkedUserId),
      gt(contacts.createdAt, Date.now() - 86_400_000)
    );
    const [, claimed] = await db.batch([
      db
        .insert(savedCards)
        .select(
          db
            .select({ userId: sql<string>`${userId}`.as('userId'), data: contacts.data })
            .from(contacts)
            .where(eligible)
        )
        .onConflictDoUpdate({ target: savedCards.userId, set: { data: sql`excluded.data` } }),
      db
        .update(contacts)
        .set({ linkedUserId: userId, claimHash: null })
        .where(eligible)
        .returning({ id: contacts.id })
    ]);
    return claimed.length > 0;
  }
  async function saveProfile(
    ownerId: string,
    input: { name: string; slug: string; message: string }
  ) {
    if (reservedSlugs.has(input.slug))
      return { ok: false, message: 'That address is reserved. Choose a different name.' } as const;
    // A single UNIQUE-guarded update prevents simultaneous claims from stealing a name.
    const current = await profile(ownerId);
    if (!current)
      return {
        ok: false,
        message: 'Your address book could not be found. Sign in again.'
      } as const;
    try {
      await db.update(profiles).set(input).where(eq(profiles.ownerId, ownerId));
      return { ok: true } as const;
    } catch (cause) {
      const collision = await publicProfile(input.slug);
      if (collision && collision.ownerId !== ownerId)
        return {
          ok: false,
          message: 'That page address is already taken. Try another one.'
        } as const;
      throw cause;
    }
  }
  return {
    profile,
    publicProfile,
    ensureProfile,
    contacts: listContacts,
    invitations: listInvitations,
    openInvitations,
    deleteInvitation,
    renewInvitation,
    renameInvitation,
    invitationState,
    createInvitations,
    invitationPage,
    invitation,
    submit,
    claim,
    saveProfile
  };
}
