import { afterEach, describe, expect, spyOn, test } from 'bun:test';
import { InvitationToken } from './invitation-token';
import { and, eq } from 'drizzle-orm';
import { testDatabase } from '../../../test/database';
import { addressBook } from './address-book';
import { contacts, invitations } from './schema';
import { invitationReference } from '../invitation-token';
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
  test('does not publish an account surname in the default profile or address', async () => {
    const { book } = await setup();
    const profile = await book.ensureProfile('new-owner', 'Taylor Morgan');
    expect(profile.name).toBe('Taylor');
    expect(profile.slug).toBe('taylor');
    expect((await book.publicProfile(profile.slug))?.name).toBe('Taylor');
    await book.saveProfile(profile.ownerId, {
      name: 'My chosen name',
      slug: 'my-chosen-page',
      message: ''
    });
    expect((await book.ensureProfile(profile.ownerId, 'Taylor Morgan')).name).toBe(
      'My chosen name'
    );
  });
  test('starts with the first name as the page address, numbering only when it is taken', async () => {
    const { book } = await setup();
    // setup() already created "augie" for the owner.
    expect((await book.ensureProfile('second-augie', 'Augie Doe')).slug).toBe('augie2');
    expect((await book.ensureProfile('third-augie', 'augie')).slug).toBe('augie3');
    expect((await book.ensureProfile('jose', 'José Núñez')).slug).toBe('jose');
    expect((await book.ensureProfile('admin', 'Admin')).slug).toBe('admin2');
    expect((await book.ensureProfile('al', 'Al')).slug).toBe('al2');
    expect((await book.ensureProfile('emoji', '🙂')).slug).toBe('friend');
    expect((await book.ensureProfile('second-augie', 'Someone Else')).slug).toBe('augie2');
  });
  test('creates short tokens containing the searchable invitation reference', async () => {
    const { invite } = await setup();
    expect(invite.token).toMatch(/^[A-Za-z0-9_-]{7}$/);
    expect(invite.token.startsWith(invitationReference(invite))).toBe(true);
  });
  test('retries collisions without reassigning existing invitations or duplicating batch labels', async () => {
    const { book, owner, other, invite } = await setup();
    const generator = spyOn(InvitationToken, 'generate')
      .mockReturnValueOnce(invite.token)
      .mockReturnValueOnce('Batch_2')
      .mockReturnValueOnce('Batch_1');
    try {
      const batch = await book.createInvitations(other.ownerId, 2, 'Friend');
      expect(batch.map(({ label }) => label).sort()).toEqual(['Friend 1', 'Friend 2']);
      expect(new Set(batch.map(({ token }) => token)).size).toBe(2);
      expect(await book.invitationPage(invite.token)).toBe(owner.slug);
      for (const item of batch) expect(await book.invitationPage(item.token)).toBe(other.slug);
    } finally {
      generator.mockRestore();
    }
  });
  test('legacy references remain searchable without a stored fragment', () => {
    expect(invitationReference({ id: '01234567-example', reference: null })).toBe('01234567');
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
  test.each([18, 32])(
    'existing tokens from %i random bytes still accept one submission',
    async (bytes) => {
      const { db, book, owner, invite, contact } = await setup();
      const token = randomBytes(bytes).toString('base64url');
      await db
        .update(invitations)
        .set({ tokenHash: createHash('sha256').update(token).digest('hex') })
        .where(eq(invitations.id, invite.id));
      expect(await book.invitationPage(token)).toBe(owner.slug);
      expect(await book.invitation(token, owner.slug)).not.toBeNull();
      expect((await book.submit(token, owner.slug, contact)).ok).toBe(true);
      expect((await book.submit(token, owner.slug, contact)).ok).toBe(false);
    }
  );
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
  test("only the owner's listing exposes a link's token", async () => {
    const { book, other, invite } = await setup();
    expect(JSON.stringify(await book.openInvitations(other.ownerId))).not.toContain(invite.token);
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
describe('managing open invitations', () => {
  test('lists only open and expired links, with their full token so they can be copied again', async () => {
    const { db, book, owner, invite, contact } = await setup();
    const [used] = await book.createInvitations(owner.ownerId, 1, 'Riley');
    if (!used) throw new Error('Test invitation was not created.');
    expect((await book.submit(used.token, owner.slug, contact)).ok).toBe(true);
    await db.update(invitations).set({ status: 'revoked' }).where(eq(invitations.id, used.id));
    const [expired] = await book.createInvitations(owner.ownerId, 1, 'Sam');
    if (!expired) throw new Error('Test invitation was not created.');
    await db.update(invitations).set({ expiresAt: 0 }).where(eq(invitations.id, expired.id));
    const open = await book.openInvitations(owner.ownerId);
    expect(
      open
        .map(({ label, token }) => ({ label, token }))
        .sort((a, b) => a.label.localeCompare(b.label))
    ).toEqual([
      { label: 'Jamie', token: invite.token },
      { label: 'Sam', token: expired.token }
    ]);
  });
  test('deleting an open link stops it working, and used links cannot be deleted', async () => {
    const { book, owner, other, invite, contact } = await setup();
    expect(await book.deleteInvitation(other.ownerId, invite.id)).toBe(false);
    expect(await book.deleteInvitation(owner.ownerId, invite.id)).toBe(true);
    expect(await book.invitationState(invite.token)).toBeNull();
    expect((await book.submit(invite.token, owner.slug, contact)).ok).toBe(false);
    const [used] = await book.createInvitations(owner.ownerId, 1, '');
    if (!used) throw new Error('Test invitation was not created.');
    expect((await book.submit(used.token, owner.slug, contact)).ok).toBe(true);
    expect(await book.deleteInvitation(owner.ownerId, used.id)).toBe(false);
    expect((await book.contacts(owner.ownerId))[0]?.source).toEqual({
      label: '',
      reference: invitationReference(used)
    });
  });
  test('renewing an expired link lets the same URL accept a submission again', async () => {
    const { db, book, owner, other, invite, contact } = await setup();
    await db.update(invitations).set({ expiresAt: 0 }).where(eq(invitations.id, invite.id));
    expect((await book.invitationState(invite.token))?.state).toBe('expired');
    expect(await book.renewInvitation(other.ownerId, invite.id)).toBe(false);
    expect(await book.renewInvitation(owner.ownerId, invite.id)).toBe(true);
    expect((await book.invitationState(invite.token))?.state).toBe('open');
    expect((await book.submit(invite.token, owner.slug, contact)).ok).toBe(true);
    expect(await book.renewInvitation(owner.ownerId, invite.id)).toBe(false);
  });
  test('renaming a link changes only its private label', async () => {
    const { book, owner, other, invite } = await setup();
    expect(await book.renameInvitation(other.ownerId, invite.id, 'Nope')).toBe(false);
    expect(await book.renameInvitation(owner.ownerId, invite.id, 'Jamie Chen')).toBe(true);
    expect((await book.openInvitations(owner.ownerId))[0]?.label).toBe('Jamie Chen');
  });
  test('reports why a link is closed and which page currently owns it', async () => {
    const { book, owner, invite, contact } = await setup();
    expect(await book.invitationState('unknown')).toBeNull();
    expect(await book.invitationState(invite.token)).toEqual({ slug: owner.slug, state: 'open' });
    await book.saveProfile(owner.ownerId, { name: owner.name, slug: 'renamed', message: '' });
    expect((await book.submit(invite.token, 'renamed', contact)).ok).toBe(true);
    expect(await book.invitationState(invite.token)).toEqual({ slug: 'renamed', state: 'used' });
  });
});
