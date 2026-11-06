import { describe, expect, test } from 'bun:test';
import { Contact, contactInput } from './contact';
import { DemoBook } from './demo-book';

const now = Date.UTC(2026, 10, 6);
const setup = () => {
  const book = DemoBook.seed(now);
  const created: string[] = [];
  const actions = DemoBook.actions(book, {
    linkUrl: (token, slug) => `https://example.test/p/${slug}/i/${token}`,
    created: (id) => created.push(id)
  });
  return { book, actions, created };
};
const maya = {
  ...Contact.empty(),
  firstName: 'Maya',
  lastName: 'Brooks',
  email: 'maya@example.com'
};

describe('DemoBook', () => {
  test('seeds contacts that pass the real form’s validation, apart from their sample photos', () => {
    for (const { data } of DemoBook.seed(now).contacts)
      expect(contactInput.safeParse({ ...data, photo: '' }).success).toBe(true);
  });

  test('starts with one open link and one expired link to renew', () => {
    const { book } = setup();
    expect(DemoBook.openLink(book, null, now)?.label).toBe('Maya');
    expect(book.invitations.filter((link) => link.expiresAt <= now).map((l) => l.label)).toEqual([
      'Theo'
    ]);
  });

  test('new links get tokens and become the link the friend opens', async () => {
    const { book, actions, created } = setup();
    const result = await actions.createInvitations({ count: 2, label: ' Sam ' });
    if (!result.ok) throw new Error(result.message);
    const [first, second] = result.invitations;
    if (!first || !second) throw new Error('Expected two links');
    expect(first.token).toMatch(/^[A-Za-z0-9]{7}$/);
    expect(first.label).toBe('Sam');
    expect(created).toEqual([first.id]);
    expect(DemoBook.openLink(book, first.id)?.id).toBe(first.id);
  });

  test('refuses links past the open limit without adding any', async () => {
    const { book, actions } = setup();
    const before = book.invitations.length;
    const result = await actions.createInvitations({ count: 20, label: '' });
    expect(result.ok).toBe(false);
    expect(book.invitations).toHaveLength(before);
  });

  test('a sent card joins People with its link as the source, and the link is used up', () => {
    const { book } = setup();
    expect(DemoBook.submit(book, 'demo-link-maya', maya, now)).toEqual({ ok: true });
    const added = book.contacts.find((contact) => contact.invitationId === 'demo-link-maya');
    expect(added?.data.firstName).toBe('Maya');
    expect(added?.source).toEqual({ label: 'Maya', reference: 'Mq7' });
    expect(book.invitations.some((link) => link.id === 'demo-link-maya')).toBe(false);
    expect(DemoBook.submit(book, 'demo-link-maya', maya, now).ok).toBe(false);
  });

  test('an expired link can’t be sent until it is renewed', async () => {
    const { book, actions } = setup();
    expect(DemoBook.submit(book, 'demo-link-theo', maya, now).ok).toBe(false);
    expect(await actions.renewInvitation('demo-link-theo')).toEqual({ ok: true });
    expect(DemoBook.submit(book, 'demo-link-theo', maya).ok).toBe(true);
  });

  test('renames, deletes and removes in place', async () => {
    const { book, actions } = setup();
    await actions.renameInvitation({ id: 'demo-link-maya', label: 'Maya B.' });
    expect(book.invitations[0]?.label).toBe('Maya B.');
    await actions.deleteInvitation('demo-link-maya');
    expect(await actions.deleteInvitation('demo-link-maya')).toMatchObject({ ok: false });
    await actions.deleteContact('demo-contact-1');
    expect(book.contacts.some((contact) => contact.id === 'demo-contact-1')).toBe(false);
  });

  test('a card downloads as a vCard without the server', () => {
    const { book, actions } = setup();
    const [first] = book.contacts;
    if (!first) throw new Error('No seeded contact');
    const href = actions.vcardHref(first);
    expect(href.startsWith('data:text/vcard;charset=utf-8,')).toBe(true);
    expect(decodeURIComponent(href)).toContain('FN:Alex Morgan');
  });
});
