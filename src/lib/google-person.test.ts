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
  test('fills empty fields and turns differing details into choices with defaults', () => {
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
        names: [{ givenName: 'Jim', familyName: 'Chen' }],
        emailAddresses: [{ value: 'jamie@work.com', type: 'work', metadata: { primary: true } }],
        organizations: [{ name: 'acme' }]
      })
    );
    expect(plan.choices.map(({ key, selected }) => ({ key, selected }))).toEqual([
      { key: 'names', selected: 'google' },
      { key: 'emailAddresses', selected: 'both' }
    ]);
    expect(plan.update.emailAddresses).toEqual([
      { value: 'jamie@work.com', type: 'work' },
      { value: 'Jamie@Example.com', type: 'home' }
    ]);
    expect(plan.update.names).toBeUndefined();
    expect(plan.fields.sort()).toEqual([
      'addresses',
      'birthdays',
      'emailAddresses',
      'phoneNumbers',
      'urls'
    ]);
    expect(plan.update.etag).toBe('etag-1');
  });
  test('applies decisions: replace with the card, or keep Google', () => {
    const existing = person({
      names: [{ givenName: 'Jim', familyName: 'Chen' }],
      emailAddresses: [{ value: 'jamie@work.com' }],
      phoneNumbers: [{ value: '555 0000' }]
    });
    const plan = GooglePerson.merge(jamie, existing, {
      names: 'card',
      emailAddresses: 'google',
      phoneNumbers: 'card'
    });
    expect(plan.update.names).toEqual([{ givenName: 'Jamie', familyName: 'Chen' }]);
    expect(plan.update.emailAddresses).toBeUndefined();
    expect(plan.update.phoneNumbers).toEqual([{ value: '(312) 555-0100', type: 'mobile' }]);
  });
  test('keeping both notes appends the card’s notes', () => {
    const plan = GooglePerson.merge(
      { ...jamie, email: '', phone: '', notes: 'Text me' },
      person({ biographies: [{ value: 'Met at camp' }] })
    );
    expect(plan.update.biographies).toEqual([
      { value: 'Met at camp\n\nText me', contentType: 'TEXT' }
    ]);
  });
  test('adds new custom answers and offers a choice for different ones', () => {
    const card = {
      ...jamie,
      custom: [
        { id: 'discord', label: 'Discord', value: 'jamie#1' },
        { id: 'shirt', label: 'Shirt size', value: 'M' }
      ]
    };
    const existing = person({
      emailAddresses: [{ value: 'jamie@example.com' }],
      phoneNumbers: [{ value: '3125550100' }],
      names: [{ givenName: 'Jamie', familyName: 'Chen' }],
      userDefined: [
        { key: 'Pet', value: 'Dog' },
        { key: 'shirt size', value: 'L' }
      ]
    });
    const plan = GooglePerson.merge(card, existing);
    expect(plan.choices).toEqual([
      {
        key: 'custom:shirt size',
        label: 'Shirt size',
        google: 'L',
        card: 'M',
        options: ['card', 'google'],
        selected: 'card'
      }
    ]);
    expect(plan.update.userDefined).toEqual([
      { key: 'Pet', value: 'Dog' },
      { key: 'shirt size', value: 'M' },
      { key: 'Discord', value: 'jamie#1' }
    ]);
    expect(
      GooglePerson.merge(card, existing, { 'custom:shirt size': 'google' }).update.userDefined
    ).toEqual([
      { key: 'Pet', value: 'Dog' },
      { key: 'shirt size', value: 'L' },
      { key: 'Discord', value: 'jamie#1' }
    ]);
  });
  test('adds a photo only when Google has just the placeholder', () => {
    const card = { ...jamie, photo: 'data:image/jpeg;base64,AAAA' };
    expect(GooglePerson.merge(card, person({ photos: [{ default: true }] })).addPhoto).toBe(true);
    expect(GooglePerson.merge(card, person({ photos: [{}] })).addPhoto).toBe(false);
  });
  test('changes nothing and asks nothing when Google already has the same details', () => {
    const plan = GooglePerson.merge(
      jamie,
      person({
        names: [{ givenName: 'Jamie', familyName: 'Chen' }],
        emailAddresses: [{ value: 'jamie@example.com' }],
        phoneNumbers: [{ value: '312.555.0100' }]
      })
    );
    expect(plan).toMatchObject({ fields: [], choices: [], addPhoto: false });
  });
});
