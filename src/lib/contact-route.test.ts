import { expect, test } from 'bun:test';
import { contactRoute } from './contact-route';

test('routes only a single claimed subdomain on the configured domain', () => {
  expect(contactRoute(new URL('https://augie.contacts.exchange/'), 'contacts.exchange')).toBe(
    '/p/augie'
  );
  const token = 'a'.repeat(43);
  expect(
    contactRoute(new URL(`https://augie.contacts.exchange/i/${token}`), 'contacts.exchange')
  ).toBe(`/p/augie/i/${token}`);
  for (const url of [
    'https://contacts.exchange/',
    'https://contacts.exchange.evil.test/',
    'https://a.b.contacts.exchange/',
    'https://augie.contacts.exchange/login',
    'https://augie-.contacts.exchange/'
  ]) {
    expect(contactRoute(new URL(url), 'contacts.exchange')).toBeUndefined();
  }
});
