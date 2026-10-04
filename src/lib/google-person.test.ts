import { describe, expect, test } from 'bun:test';
import { Contact } from './contact';
import { GooglePerson } from './google-person';

const jamie = {
  ...Contact.empty(),
  firstName: 'Jamie',
  lastName: 'Chen',
  email: 'Jamie@Example.com',
  phone: '(312) 555-0100'
};
const person = (fields: Partial<GooglePerson>): GooglePerson => ({
  resourceName: 'people/c1',
  etag: 'etag-1',
  ...fields
});

describe('matching existing Google contacts', () => {
  test('matches by email, ignoring case', () => {
    const match = person({
      resourceName: 'people/email',
      emailAddresses: [{ value: 'jamie@example.com' }]
    });
    expect(GooglePerson.match(jamie, [person({}), match])?.resourceName).toBe('people/email');
  });
  test('matches phone numbers written differently', () => {
    const match = person({
      resourceName: 'people/phone',
      phoneNumbers: [{ value: '+1 312-555-0100' }]
    });
    expect(GooglePerson.match(jamie, [match])?.resourceName).toBe('people/phone');
  });
  test('matches by name only when exactly one contact has it', () => {
    const named = (id: string) =>
      person({ resourceName: id, names: [{ givenName: 'jamie', familyName: 'CHEN' }] });
    const card = { ...jamie, email: '', phone: '555' };
    expect(GooglePerson.match(card, [named('people/a')])?.resourceName).toBe('people/a');
    expect(GooglePerson.match(card, [named('people/a'), named('people/b')])).toBeNull();
    expect(GooglePerson.match(card, [person({ names: [{ givenName: 'Sam' }] })])).toBeNull();
  });
});

describe('merging into an existing Google contact', () => {
  test('fills only empty fields and reports details that differ', () => {
    const card = {
      ...jamie,
      city: 'Chicago',
      birthday: '1996-02-29',
      company: 'Acme',
      website: 'https://jamie.dev'
    };
    const plan = GooglePerson.merge(
      card,
      person({
        names: [{ givenName: 'Jamie', familyName: 'Chen' }],
        emailAddresses: [{ value: 'jamie@work.com' }],
        organizations: [{ name: 'acme' }]
      })
    );
    expect(plan.fields.sort()).toEqual(['addresses', 'birthdays', 'phoneNumbers', 'urls']);
    expect(plan.update.phoneNumbers).toEqual([{ value: '(312) 555-0100', type: 'mobile' }]);
    expect(plan.update.etag).toBe('etag-1');
    expect(plan.conflicts).toEqual([
      { field: 'Email', google: 'jamie@work.com', card: 'Jamie@Example.com' }
    ]);
  });
  test('adds custom answers without dropping the contact’s other custom fields', () => {
    const card = {
      ...jamie,
      custom: [
        { id: 'discord', label: 'Discord', value: 'jamie#1' },
        { id: 'shirt', label: 'Shirt size', value: 'M' }
      ]
    };
    const plan = GooglePerson.merge(
      card,
      person({
        emailAddresses: [{ value: 'jamie@example.com' }],
        phoneNumbers: [{ value: '3125550100' }],
        names: [{ givenName: 'Jamie', familyName: 'Chen' }],
        userDefined: [
          { key: 'Pet', value: 'Dog' },
          { key: 'shirt size', value: 'L' }
        ]
      })
    );
    expect(plan.update.userDefined).toEqual([
      { key: 'Pet', value: 'Dog' },
      { key: 'shirt size', value: 'L' },
      { key: 'Discord', value: 'jamie#1' }
    ]);
    expect(plan.conflicts).toEqual([{ field: 'Shirt size', google: 'L', card: 'M' }]);
  });
  test('adds a photo only when Google has just the placeholder', () => {
    const card = { ...jamie, photo: 'data:image/jpeg;base64,AAAA' };
    expect(GooglePerson.merge(card, person({ photos: [{ default: true }] })).addPhoto).toBe(true);
    expect(GooglePerson.merge(card, person({ photos: [{}] })).addPhoto).toBe(false);
  });
  test('changes nothing when Google already has the same details', () => {
    const plan = GooglePerson.merge(
      jamie,
      person({
        names: [{ givenName: 'Jamie', familyName: 'Chen' }],
        emailAddresses: [{ value: 'jamie@example.com' }],
        phoneNumbers: [{ value: '312.555.0100' }]
      })
    );
    expect(plan).toMatchObject({ fields: [], conflicts: [], addPhoto: false });
  });
});
