import { afterEach, expect, test } from 'bun:test';
import { testDatabase } from '../../../test/database';
import { addressBook } from './address-book';
import { importGoogleContact, listGooglePeople } from './google-contacts';
import { googleImports } from './schema';
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
    (
      await importGoogleContact(
        db,
        contact,
        { accountId: 'google-account', token: 'test-token', people: [] },
        request
      )
    ).status
  ).toBe('imported');
  expect(
    (
      await importGoogleContact(
        db,
        contact,
        { accountId: 'google-account', token: 'test-token', people: [] },
        request
      )
    ).status
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
    (
      await importGoogleContact(
        db,
        contact,
        { accountId: 'google-account', token: 'test-token', people: [] },
        request
      )
    ).status
  ).toBe('failed');
  expect(
    (
      await importGoogleContact(
        db,
        contact,
        { accountId: 'google-account', token: 'test-token', people: [] },
        request
      )
    ).status
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
        { accountId: 'google-account', token: 'test-token', people: [] },
        async () => new Response('', { status: 403 })
      )
    ).status
  ).toBe('failed');
  expect(
    (
      await importGoogleContact(
        db,
        contact,
        { accountId: 'google-account', token: 'test-token', people: [] },
        async () => Response.json({ resourceName: 'people/c123' })
      )
    ).status
  ).toBe('imported');
});
test('fills in a matching Google contact instead of creating a duplicate', async () => {
  const { db, contact } = await setup();
  const calls: { url: string; init: RequestInit }[] = [];
  const existing = {
    resourceName: 'people/c9',
    etag: 'etag-9',
    names: [{ givenName: 'Jamie', familyName: 'Chen' }],
    emailAddresses: [{ value: 'JAMIE@example.com' }],
    organizations: [{ name: 'Old Co' }]
  };
  const request = async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return Response.json({ ...existing, etag: 'etag-10' });
  };
  const card = { ...contact, data: { ...contact.data, city: 'Chicago', company: 'New Co' } };
  // Keep Google's company name; the city is new and filled in without asking.
  const target = {
    accountId: 'google-account',
    token: 'token',
    people: [existing],
    decisions: { organizations: 'google' as const }
  };
  expect(await importGoogleContact(db, card, target, request)).toMatchObject({ status: 'merged' });
  expect(calls).toHaveLength(1);
  expect(calls[0]?.url).toContain('people/c9:updateContact?updatePersonFields=addresses&');
  expect(JSON.parse(String(calls[0]?.init.body))).toMatchObject({ etag: 'etag-9' });
  expect((await db.select().from(googleImports))[0]).toMatchObject({
    status: 'merged',
    resourceName: 'people/c9'
  });
  expect(await importGoogleContact(db, card, target, request)).toEqual({
    status: 'skipped',
    previous: 'merged'
  });
});
test('replacing a detail with the card’s version is sent to Google', async () => {
  const { db, contact } = await setup();
  const bodies: unknown[] = [];
  const existing = {
    resourceName: 'people/c9',
    names: [{ givenName: 'Jamie', familyName: 'Chen' }],
    emailAddresses: [{ value: 'jamie@example.com' }],
    organizations: [{ name: 'Old Co' }]
  };
  const card = { ...contact, data: { ...contact.data, company: 'New Co' } };
  await importGoogleContact(
    db,
    card,
    { accountId: 'google-account', token: 'token', people: [existing] },
    async (_url, init) => {
      bodies.push(JSON.parse(String(init.body)));
      return Response.json(existing);
    }
  );
  expect(bodies[0]).toMatchObject({ organizations: [{ name: 'New Co' }] });
});
test('a failed update can be retried and never creates a new contact', async () => {
  const { db, contact } = await setup();
  const existing = { resourceName: 'people/c9', emailAddresses: [{ value: 'jamie@example.com' }] };
  const urls: string[] = [];
  const failing = async (url: string) => {
    urls.push(url);
    return new Response('', { status: 400 });
  };
  expect(
    (
      await importGoogleContact(
        db,
        contact,
        { accountId: 'google-account', token: 'token', people: [existing] },
        failing
      )
    ).status
  ).toBe('failed');
  expect(urls.every((url) => !url.includes('createContact'))).toBe(true);
  expect(await db.select().from(googleImports)).toHaveLength(0);
});
test('a rejected update explains Google’s reason, and only access problems stop the run', async () => {
  const { db, contact } = await setup();
  const existing = { resourceName: 'people/c9', emailAddresses: [{ value: 'jamie@example.com' }] };
  const card = { ...contact, data: { ...contact.data, company: 'New Co' } };
  const target = { accountId: 'google-account', token: 'token', people: [existing] };
  const rejecting = (status: number) => async () =>
    Response.json({ error: { message: 'Invalid organization' } }, { status });
  expect(await importGoogleContact(db, card, target, rejecting(400))).toMatchObject({
    status: 'failed',
    fatal: false,
    message: expect.stringContaining('Invalid organization')
  });
  expect(await importGoogleContact(db, card, target, rejecting(401))).toMatchObject({
    status: 'failed',
    fatal: true
  });
});
test('an update Google accepted still counts as merged when its reply is unreadable', async () => {
  const { db, contact } = await setup();
  const existing = { resourceName: 'people/c9', emailAddresses: [{ value: 'jamie@example.com' }] };
  const card = { ...contact, data: { ...contact.data, company: 'New Co' } };
  const result = await importGoogleContact(
    db,
    card,
    { accountId: 'google-account', token: 'token', people: [existing] },
    async () => new Response('not json')
  );
  expect(result).toMatchObject({ status: 'merged', person: existing });
  expect((await db.select().from(googleImports))[0]).toMatchObject({ status: 'merged' });
});
test('lists every page of Google contacts', async () => {
  const pages: Record<string, unknown> = {
    '': { connections: [{ resourceName: 'people/a' }], nextPageToken: 'next' },
    next: { connections: [{ resourceName: 'people/b' }, { broken: true }] }
  };
  const result = await listGooglePeople('token', async (url) =>
    Response.json(pages[new URL(url).searchParams.get('pageToken') ?? ''])
  );
  expect(result).toEqual({
    ok: true,
    people: [{ resourceName: 'people/a' }, { resourceName: 'people/b' }]
  });
});
