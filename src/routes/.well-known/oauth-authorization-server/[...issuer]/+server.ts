import { oauthProviderAuthServerMetadata } from '@better-auth/oauth-provider';
import { auth } from '#lib/server/auth.ts';

// RFC 8414 inserts the issuer path (/api/auth) after the well-known prefix, outside Better Auth's routes.
export const GET = oauthProviderAuthServerMetadata(auth, {
  headers: { 'Access-Control-Allow-Origin': '*' }
});
