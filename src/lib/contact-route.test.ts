import { expect, test } from 'bun:test';
import { contactRoute } from './contact-route';

test('routes only a single claimed subdomain on the configured domain', () => {
  expect(contactRoute(new URL('https://augie.contacts.exchange/'), 'contacts.exchange')).toBe(
    '/p/augie'
  );
  for (const length of [7, 24, 43]) {
    const token = 'a'.repeat(length);
    expect(
      contactRoute(new URL(`https://augie.contacts.exchange/i/${token}`), 'contacts.exchange')
    ).toBe(`/p/augie/i/${token}`);
  }
  for (const url of [
    'https://contacts.exchange/',
    'https://contacts.exchange.evil.test/',
    'https://a.b.contacts.exchange/',
    'https://augie.contacts.exchange/login',
    'https://augie-.contacts.exchange/',
    `https://augie.contacts.exchange/i/${'a'.repeat(23)}`,
    `https://augie.contacts.exchange/i/${'a'.repeat(25)}`,
    `https://augie.contacts.exchange/i/${'a'.repeat(24)}/extra`
  ]) {
    expect(contactRoute(new URL(url), 'contacts.exchange')).toBeUndefined();
  }
});
