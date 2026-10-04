import { describe, expect, test } from 'bun:test';
import { Contact, contactInput } from './contact';
import { FormConfig } from './form-config';

const person = {
  ...Contact.empty(),
  firstName: 'Jamie',
  lastName: 'Chen',
  email: 'jamie@example.com'
};
const discord = { id: 'discord', label: 'Discord username', required: true };

describe('form requirements', () => {
  test('cards saved before custom fields existed still parse', () => {
    const { custom: _custom, ...legacy } = person;
    expect(contactInput.parse(legacy).custom).toEqual([]);
  });
  test('an unset or malformed config asks only for the basics', () => {
    expect(FormConfig.parse(null)).toEqual({ required: [], custom: [] });
    expect(FormConfig.parse({ required: ['shoe size'] })).toEqual({ required: [], custom: [] });
    expect(FormConfig.missing(FormConfig.parse(null), person)).toBeNull();
  });
  test('a required address needs street, city, postal code, and country', () => {
    const config = { required: ['address' as const], custom: [] };
    expect(FormConfig.missing(config, person)).toEqual({
      field: 'street',
      message: 'Add your mailing address.'
    });
    const almost = { ...person, street: '1 Main St', city: 'Chicago', country: 'US' };
    expect(FormConfig.missing(config, almost)?.field).toBe('postalCode');
    expect(FormConfig.missing(config, { ...almost, postalCode: '60601' })).toBeNull();
  });
  test('required custom fields use the owner’s labels, not the submitted ones', () => {
    const config = {
      required: [],
      custom: [discord, { id: 'shirt', label: 'Shirt size', required: false }]
    };
    const answers = FormConfig.answers(config, [
      { id: 'discord', label: 'Injected label', value: '  jamie#1 ' },
      { id: 'unknown', label: 'Extra', value: 'ignored' },
      { id: 'shirt', label: 'Shirt size', value: '' }
    ]);
    expect(answers).toEqual([{ id: 'discord', label: 'Discord username', value: 'jamie#1' }]);
    expect(FormConfig.missing(config, { ...person, custom: answers })).toBeNull();
    expect(FormConfig.missing(config, person)).toEqual({
      field: 'custom-discord',
      message: 'Add your Discord username.'
    });
  });
  test('prefills custom answers from a saved card by matching the field name', () => {
    const config = { required: [], custom: [discord] };
    const saved = {
      ...person,
      custom: [{ id: 'other-owner-id', label: 'discord USERNAME', value: 'jamie#1' }]
    };
    expect(FormConfig.prefill(config, saved)).toEqual([
      { id: 'discord', label: 'Discord username', value: 'jamie#1' }
    ]);
  });
  test('rejects duplicate custom field names', () => {
    expect(
      FormConfig.schema.safeParse({ required: [], custom: [discord, { ...discord, id: 'b' }] })
        .success
    ).toBe(false);
  });
});
