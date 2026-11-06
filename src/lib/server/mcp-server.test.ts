import { afterEach, describe, expect, test } from 'bun:test';
import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { testDatabase } from '../../../test/database';
import { Contact } from '../contact';
import { addressBook, OPEN_INVITATION_LIMIT } from './address-book';
import { contactsMcpServer } from './mcp-server';
import { contacts, feedback } from './schema';

const cleanup: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});

async function setup() {
  const { db, close } = await testDatabase();
  cleanup.push(close);
  const book = addressBook(db);
  const owner = await book.ensureProfile('owner', 'Augie');
  await book.ensureProfile('other', 'Other');
  const add = (ownerId: string, firstName: string, extra: Partial<Contact['data']> = {}) =>
    db.insert(contacts).values({
      id: `${ownerId}-${firstName}`,
      ownerId,
      createdAt: Date.now(),
      data: { ...Contact.empty(), firstName, lastName: 'Example', email: 'a@example.com', ...extra }
    });
  const connect = async (ownerId: string) => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = contactsMcpServer({
      db,
      ownerId,
      clientId: 'test-client',
      invitationLink: (token, slug) => `https://example.test/p/${slug}/i/${token}`
    });
    await server.connect(serverTransport);
    const client = new Client({ name: 'test', version: '0.0.0' });
    await client.connect(clientTransport);
    cleanup.push(() => client.close());
    const call = async (name: string, args: Record<string, unknown> = {}) => {
      const result = await client.callTool({ name, arguments: args });
      const [content] = 'content' in result && Array.isArray(result.content) ? result.content : [];
      const text = content?.type === 'text' ? String(content.text) : '';
      return { isError: Boolean('isError' in result && result.isError), text };
    };
    return { call };
  };
  return { db, book, owner, add, connect };
}

describe('contacts MCP server', () => {
  test('lists only the owner’s contacts, without photos, filtered by search', async () => {
    const { add, connect } = await setup();
    await add('owner', 'Jamie', { photo: 'data:image/png;base64,AAAA', company: 'Acme' });
    await add('owner', 'Robin');
    await add('other', 'Sam');
    const { call } = await connect('owner');
    const all = JSON.parse((await call('list_contacts')).text);
    expect(all.map((c: { firstName: string }) => c.firstName).sort()).toEqual(['Jamie', 'Robin']);
    const [jamie] = JSON.parse((await call('list_contacts', { search: 'acme' })).text);
    expect(jamie).toMatchObject({ firstName: 'Jamie', hasPhoto: true });
    expect(jamie).not.toHaveProperty('photo');
  });

  test('creates invitation links on the owner’s page and lists them', async () => {
    const { owner, connect } = await setup();
    const { call } = await connect('owner');
    const created = JSON.parse(
      (await call('create_invitations', { count: 2, label: 'Club' })).text
    );
    expect(created.map((i: { label: string }) => i.label)).toEqual(['Club 1', 'Club 2']);
    for (const { url } of created)
      expect(url).toStartWith(`https://example.test/p/${owner.slug}/i/`);
    const listed = JSON.parse((await call('list_invitations')).text);
    expect(listed.map((i: { url: string }) => i.url).sort()).toEqual(
      created.map((i: { url: string }) => i.url).sort()
    );
  });

  test('refuses to create links past the open link limit', async () => {
    const { book, connect } = await setup();
    await book.createInvitations('owner', OPEN_INVITATION_LIMIT, '');
    const { call } = await connect('owner');
    const result = await call('create_invitations', { count: 1 });
    expect(result.isError).toBe(true);
    expect(result.text).toContain('No links were created');
    expect(await book.openCount('owner')).toBe(OPEN_INVITATION_LIMIT);
  });

  test('explains how to recover when the account has no address book yet', async () => {
    const { connect } = await setup();
    const { call } = await connect('no-profile');
    const result = await call('create_invitations', { count: 1 });
    expect(result.isError).toBe(true);
    expect(result.text).toContain('Open Contacts Exchange');
  });

  test('records feedback with the sender and the app that sent it', async () => {
    const { db, connect } = await setup();
    const { call } = await connect('owner');
    expect((await call('send_feedback', { message: 'list_contacts needs paging' })).isError).toBe(
      false
    );
    expect(await db.select().from(feedback)).toMatchObject([
      { userId: 'owner', clientId: 'test-client', message: 'list_contacts needs paging' }
    ]);
  });

  test('rejects blank feedback without storing it', async () => {
    const { db, connect } = await setup();
    const { call } = await connect('owner');
    expect((await call('send_feedback', { message: '   ' })).isError).toBe(true);
    expect(await db.select().from(feedback)).toEqual([]);
  });
});
