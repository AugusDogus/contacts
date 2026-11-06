import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { jwt } from 'better-auth/plugins';
import { mcp } from '@better-auth/mcp';
import { cimd } from '@better-auth/cimd';
import { fetchClientMetadataResource } from '@better-auth/cimd/node';
import { getRequestEvent } from '$app/server';
import { building, dev } from '$app/env';
import * as env from '$app/env/private';
import { db } from './db';
import * as schema from './schema';
import { McpScope } from './mcp-scope';

if (!dev && !building && (!env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL)) {
  throw new Error(
    'Set BETTER_AUTH_SECRET and BETTER_AUTH_URL before starting Contacts Exchange in production.'
  );
}
export const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
const baseURL = env.BETTER_AUTH_URL || 'http://localhost:5173';
/** The MCP endpoint. Access tokens are audience-bound to this exact URL. */
export const mcpResource = `${baseURL}/mcp`;
const accessTokenSeconds = 3600;
/** Each refresh issues a token valid this long again, so a grant lives while it is used monthly. */
const refreshTokenSeconds = 30 * 24 * 3600;
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  baseURL,
  // MCP access tokens share the JWT plugin's signing key, so session JWTs stay disabled.
  disabledPaths: ['/token'],
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
  plugins: [
    jwt({ disableSettingJwtHeader: true }),
    mcp({
      loginPage: '/login',
      consentPage: '/consent',
      resource: mcpResource,
      scopes: [
        'openid',
        'profile',
        'email',
        'offline_access',
        McpScope.readContacts,
        McpScope.writeInvitations
      ],
      accessTokenExpiresIn: accessTokenSeconds,
      refreshTokenExpiresIn: refreshTokenSeconds,
      // MCP clients often run several instances from one stored grant, each refreshing its own
      // copy. A sibling presenting a token rotated while that rotation's access token is still
      // live gets the same response instead of revoking every token for the client and user.
      refreshTokenReuseInterval: accessTokenSeconds
    }),
    cimd({ fetchClientMetadataResource, metadataProfile: 'mcp-2026-07-28' }),
    sveltekitCookies(getRequestEvent)
  ]
});
