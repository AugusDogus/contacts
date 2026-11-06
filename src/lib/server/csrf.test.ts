import { describe, expect, test } from 'bun:test';
import { Csrf } from './csrf';

const origin = 'https://contacts.exchange';
const post = (path: string, headers: Record<string, string>) =>
  new Request(`${origin}${path}`, { method: 'POST', headers, body: 'a=1' });
const form = { 'content-type': 'application/x-www-form-urlencoded' };

describe('cross-site form protection', () => {
  test('lets OAuth clients exchange codes from their own servers', () => {
    for (const path of [
      '/api/auth/oauth2/token',
      '/api/auth/oauth2/revoke',
      '/api/auth/oauth2/introspect'
    ]) {
      expect(Csrf.isForbidden(post(path, form))).toBe(false);
      expect(Csrf.isForbidden(post(path, { ...form, origin: 'https://v2.executor.sh' }))).toBe(
        false
      );
    }
  });

  test('still refuses cross-site and origin-less form posts everywhere else', () => {
    for (const path of [
      '/settings',
      '/api/auth/sign-in/email',
      '/api/auth/oauth2/consent',
      '/mcp'
    ]) {
      expect(Csrf.isForbidden(post(path, { ...form, origin: 'https://evil.example' }))).toBe(true);
      expect(Csrf.isForbidden(post(path, form))).toBe(true);
      expect(Csrf.isForbidden(post(path, { 'content-type': 'text/plain' }))).toBe(true);
    }
  });

  test('does not apply to a similar path that only shares the prefix', () => {
    expect(Csrf.isForbidden(post('/api/auth/oauth2/token-x', form))).toBe(true);
  });

  test('allows same-origin forms, non-form bodies, and safe methods', () => {
    expect(Csrf.isForbidden(post('/settings', { ...form, origin }))).toBe(false);
    expect(Csrf.isForbidden(post('/mcp', { 'content-type': 'application/json' }))).toBe(false);
    expect(Csrf.isForbidden(new Request(`${origin}/settings`))).toBe(false);
  });
});
