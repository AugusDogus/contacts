import { afterEach, describe, expect, test } from 'bun:test';
import { and, eq } from 'drizzle-orm';
import { testDatabase } from '../../../test/database';
import { addressBook } from './address-book';
import { contacts, invitations } from './schema';
import { Contact } from '../contact';
import { createHash, randomBytes } from 'node:crypto';

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0)) close();
});
async function setup() {
  const { db, close } = await testDatabase();
  cleanup.push(close);
  const book = addressBook(db);
  const owner = await book.ensureProfile('owner', 'Augie');
  const other = await book.ensureProfile('other', 'Other');
  const invite = (await book.createInvitations(owner.ownerId, 1, 'Jamie'))[0];
  if (!invite) throw new Error('Test invitation was not created.');
  const contact = {
    ...Contact.empty(),
    firstName: 'Jamie',
    lastName: 'Chen',
    email: 'jamie@example.com'
  };
  return { db, book, owner, other, invite, contact };
}
describe('private invitations', () => {
  test('creates short tokens containing the searchable invitation reference', async () => {
    const { invite } = await setup();
    expect(invite.token).toMatch(/^[A-Za-z0-9_-]{24}$/);
    expect(invite.token.startsWith(invite.id.slice(0, 8))).toBe(true);
  });
  test('resolves the current page after a rename and preserves closed invitation states', async () => {
    const { book, owner, invite, contact } = await setup();
    expect(await book.invitationPage('unknown')).toBeNull();
    expect(await book.invitationPage(invite.token)).toBe(owner.slug);
    await book.saveProfile(owner.ownerId, { name: owner.name, slug: 'new-address', message: '' });
    expect(await book.invitationPage(invite.token)).toBe('new-address');
    expect((await book.submit(invite.token, 'new-address', contact)).ok).toBe(true);
    expect(await book.invitationPage(invite.token)).toBe('new-address');
    expect(await book.invitation(invite.token, 'new-address')).toBeNull();
  });
  test('existing long tokens still resolve and accept one submission', async () => {
    const { db, book, owner, invite, contact } = await setup();
    const token = randomBytes(32).toString('base64url');
    await db
      .update(invitations)
      .set({ tokenHash: createHash('sha256').update(token).digest('hex') })
      .where(eq(invitations.id, invite.id));
    expect(await book.invitationPage(token)).toBe(owner.slug);
    expect(await book.invitation(token, owner.slug)).not.toBeNull();
    expect((await book.submit(token, owner.slug, contact)).ok).toBe(true);
    expect((await book.submit(token, owner.slug, contact)).ok).toBe(false);
  });
  test('accepts exactly one concurrent submission and scopes contacts to the owner', async () => {
    const { book, owner, other, invite, contact } = await setup();
    const results = await Promise.all([
      book.submit(invite.token, owner.slug, contact),
      book.submit(invite.token, owner.slug, contact)
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(await book.contacts(owner.ownerId)).toHaveLength(1);
    expect(await book.contacts(other.ownerId)).toHaveLength(0);
    expect((await book.invitations(owner.ownerId))[0]?.status).toBe('used');
  });
  test('rejects wrong pages, expired links, and revoked links', async () => {
    const { db, book, owner, other, invite, contact } = await setup();
    expect((await book.submit(invite.token, other.slug, contact)).ok).toBe(false);
    await db.update(invitations).set({ expiresAt: 0 }).where(eq(invitations.id, invite.id));
    expect((await book.submit(invite.token, owner.slug, contact)).ok).toBe(false);
    await db
      .update(invitations)
      .set({ status: 'revoked', expiresAt: Date.now() + 10_000 })
      .where(eq(invitations.id, invite.id));
    expect((await book.submit(invite.token, owner.slug, contact)).ok).toBe(false);
    expect(await book.contacts(owner.ownerId)).toHaveLength(0);
  });
  test('invalid details do not consume an invitation', async () => {
    const { book, owner, invite, contact } = await setup();
    expect((await book.submit(invite.token, owner.slug, { ...contact, firstName: '' })).ok).toBe(
      false
    );
    expect(await book.invitation(invite.token, owner.slug)).not.toBeNull();
  });
  test('only a receipt can claim a card, and only once', async () => {
    const { book, owner, invite, contact } = await setup();
    const result = await book.submit(invite.token, owner.slug, contact);
    if (!result.ok) throw new Error(result.message);
    expect(await book.claim('invalid', 'attacker')).toBe(false);
    expect(await book.claim(result.receipt, 'friend')).toBe(true);
    expect(await book.claim(result.receipt, 'attacker')).toBe(false);
    expect((await book.contacts(owner.ownerId))[0]?.linkedUserId).toBe('friend');
  });
  test('stores hashes without persisting reusable raw tokens', async () => {
    const { db, invite } = await setup();
    expect(JSON.stringify(await db.select().from(invitations))).not.toContain(invite.token);
  });
  test('a subdomain cannot be claimed by a second account and reserved names are blocked', async () => {
    const { book } = await setup();
    const input = { name: 'Augie', slug: 'augie', message: 'Hello!' };
    expect((await book.saveProfile('owner', input)).ok).toBe(true);
    expect((await book.saveProfile('other', input)).ok).toBe(false);
    expect((await book.saveProfile('owner', { ...input, slug: 'admin' })).ok).toBe(false);
    expect((await book.publicProfile('augie'))?.ownerId).toBe('owner');
  });
  test('deleting a card does not reopen its invitation', async () => {
    const { db, book, owner, invite, contact } = await setup();
    await book.submit(invite.token, owner.slug, contact);
    await db
      .delete(contacts)
      .where(and(eq(contacts.ownerId, owner.ownerId), eq(contacts.invitationId, invite.id)));
    expect((await book.submit(invite.token, owner.slug, contact)).ok).toBe(false);
  });
});
