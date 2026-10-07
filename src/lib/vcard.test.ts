import { expect, test } from 'bun:test';
import { Contact, birthdaySchema } from './contact';
import { toVCard } from './vcard';
import { toGooglePerson } from './google-person';

test('exports structured fields and escapes injected vCard properties', () => {
  const card = toVCard([
    {
      id: 'test',
      ownerId: 'owner',
      invitationId: null,
      linkedUserId: null,
      createdAt: 0,
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
test('exports custom answers in the note so every contacts app keeps them', () => {
  const card = toVCard([
    {
      id: 'test',
      ownerId: 'owner',
      invitationId: null,
      linkedUserId: null,
      createdAt: 0,
      source: null,
      data: {
        ...Contact.empty(),
        firstName: 'A',
        lastName: 'B',
        email: 'a@example.com',
        pronouns: 'they/them',
        custom: [
          { id: 'discord', label: 'Discord username', value: 'a#1' },
          { id: 'insta', label: 'Instagram', value: '@a.b' },
          { id: 'shirt', label: 'Shirt size', value: 'M' }
        ]
      }
    }
  ]);
  expect(card).toContain('X-SOCIALPROFILE;type=Discord;x-user="a#1":x-apple:a%231');
  expect(card).toContain('X-SOCIALPROFILE;type=Instagram;x-user="a.b":https://instagram.com/a.b');
  expect(card).toContain('NOTE:Pronouns: they/them\\nShirt size: M');
  expect(card).not.toContain('Discord username:');
});
test('sends custom answers to Google as custom fields', () => {
  const person = toGooglePerson({
    ...Contact.empty(),
    firstName: 'A',
    lastName: 'B',
    custom: [{ id: 'discord', label: 'Discord username', value: 'a#1' }]
  });
  expect(person.userDefined).toEqual([{ key: 'Discord username', value: 'a#1' }]);
  expect(
    toGooglePerson({ ...Contact.empty(), firstName: 'A', lastName: 'B' }).userDefined
  ).toBeUndefined();
});
test('exports the apartment line in the vCard and Google extended address slots', () => {
  const data = {
    ...Contact.empty(),
    firstName: 'A',
    lastName: 'B',
    email: 'a@example.com',
    street: '1 Main St',
    street2: 'Apt 4',
    city: 'Chicago'
  };
  const card = toVCard([
    {
      id: 'test',
      ownerId: 'owner',
      invitationId: null,
      linkedUserId: null,
      createdAt: 0,
      source: null,
      data
    }
  ]);
  expect(card).toContain('ADR;TYPE=HOME:;Apt 4;1 Main St;Chicago;;;');
  expect(toGooglePerson(data).addresses?.[0]).toMatchObject({
    streetAddress: '1 Main St',
    extendedAddress: 'Apt 4'
  });
});
