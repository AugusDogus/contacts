import { expect, test } from 'bun:test';
import { Contact, birthdaySchema } from './contact';
import { toVCard } from './vcard';

test('exports structured fields and escapes injected vCard properties', () => {
  const card = toVCard([
    {
      id: 'test',
      ownerId: 'owner',
      invitationId: null,
      linkedUserId: null,
      createdAt: 0,
      favorite: false,
      source: null,
      data: {
        ...Contact.empty(),
        firstName: 'Zoë',
        lastName: 'Chen',
        email: 'zoe@example.com',
        street: '1 Main; Apt 2',
        notes: 'Hi\r\nEND:VCARD',
        birthday: '1996-02-29'
      }
    }
  ]);
  expect(card).toContain('N:Chen;Zoë;;;\r\n');
  expect(card).toContain('ADR;TYPE=HOME:;;1 Main\\; Apt 2;;;;');
  expect(card).toContain('NOTE:Hi\\nEND:VCARD');
  expect(card.split('\r\n').filter((line) => line === 'END:VCARD')).toHaveLength(1);
});
test('folds UTF-8 without breaking characters and roundtrips long notes', () => {
  const notes = 'Hello 👋 '.repeat(30);
  const card = toVCard([
    {
      id: 'test',
      ownerId: 'owner',
      invitationId: null,
      linkedUserId: null,
      createdAt: 0,
      favorite: false,
      source: null,
      data: { ...Contact.empty(), firstName: 'A', lastName: 'B', email: 'a@example.com', notes }
    }
  ]);
  for (const line of card.split('\r\n'))
    expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  expect(card.replace(/\r\n /g, '')).toContain(`NOTE:${notes}`);
});
test('rejects impossible birthdays', () => {
  expect(birthdaySchema.safeParse('2025-02-29').success).toBe(false);
  expect(birthdaySchema.safeParse('1996-02-29').success).toBe(true);
});
