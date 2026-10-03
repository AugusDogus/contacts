import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { building, dev } from '$app/env';
import * as env from '$app/env/private';
import { db } from './db';
import * as schema from './schema';

if (!dev && !building && (!env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL)) {
  throw new Error(
    'Set BETTER_AUTH_SECRET and BETTER_AUTH_URL before starting Contacts Exchange in production.'
  );
}
export const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  baseURL: env.BETTER_AUTH_URL || 'http://localhost:5173',
  secret: env.BETTER_AUTH_SECRET || 'gather-local-development-secret-not-for-production',
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID || '',
          clientSecret: env.GOOGLE_CLIENT_SECRET || '',
          accessType: 'offline'
        }
      }
    : {},
  account: { encryptOAuthTokens: true },
  rateLimit: { enabled: true, storage: 'database' },
  plugins: [sveltekitCookies(getRequestEvent)]
});
