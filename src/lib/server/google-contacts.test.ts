import { afterEach, expect, test } from 'bun:test';
import { testDatabase } from '../../../test/database';
import { addressBook } from './address-book';
import { importGoogleContact } from './google-contacts';
import { Contact } from '../contact';

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0)) close();
});
async function setup() {
  const { db, close } = await testDatabase();
  cleanup.push(close);
  const book = addressBook(db);
  const owner = await book.ensureProfile('owner', 'Augie');
  const invite = (await book.createInvitations(owner.ownerId, 1, ''))[0];
  if (!invite) throw new Error('No test invitation.');
  await book.submit(invite.token, owner.slug, {
    ...Contact.empty(),
    firstName: 'Jamie',
    lastName: 'Chen',
    email: 'jamie@example.com'
  });
  const contact = (await book.contacts(owner.ownerId))[0];
  if (!contact) throw new Error('No test contact.');
  return { db, contact };
}
test('repeated imports create a contact only once per Google account', async () => {
  const { db, contact } = await setup();
  let calls = 0;
  const request = async () => {
    calls++;
    return Response.json({ resourceName: 'people/c123' });
  };
  expect(
    (await importGoogleContact(db, contact, 'google-account', 'test-token', request)).status
  ).toBe('imported');
  expect(
    (await importGoogleContact(db, contact, 'google-account', 'test-token', request)).status
  ).toBe('skipped');
  expect(calls).toBe(1);
});
test('uncertain responses cannot silently produce duplicate contacts', async () => {
  const { db, contact } = await setup();
  let calls = 0;
  const request = async () => {
    calls++;
    throw new Error('Simulated lost response after Google accepted the write.');
  };
  expect(
    (await importGoogleContact(db, contact, 'google-account', 'test-token', request)).status
  ).toBe('failed');
  expect(
    (await importGoogleContact(db, contact, 'google-account', 'test-token', request)).status
  ).toBe('skipped');
  expect(calls).toBe(1);
});
test('a permission rejection can be retried after reconnecting', async () => {
  const { db, contact } = await setup();
  expect(
    (
      await importGoogleContact(
        db,
        contact,
        'google-account',
        'test-token',
        async () => new Response('', { status: 403 })
      )
    ).status
  ).toBe('failed');
  expect(
    (
      await importGoogleContact(db, contact, 'google-account', 'test-token', async () =>
        Response.json({ resourceName: 'people/c123' })
      )
    ).status
  ).toBe('imported');
});
