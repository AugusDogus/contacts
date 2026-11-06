import { requireMcpAuth } from '@better-auth/mcp';
import { fetchClientMetadataResource } from '@better-auth/cimd/node';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { auth, mcpResource } from '#lib/server/auth.ts';
import { db } from '#lib/server/db.ts';
import { connectedApps } from '#lib/server/connected-apps.ts';
import { McpScope } from '#lib/server/mcp-scope.ts';
import { contactsMcpServer } from '#lib/server/mcp-server.ts';
import { Discovery } from '#lib/server/discovery.ts';
import { invitationUrl } from '#lib/links.ts';

const origin = new URL(mcpResource).origin;
const resourceMetadataUrl = `${origin}/.well-known/oauth-protected-resource/mcp`;
const challengeScopes = [
  McpScope.readContacts,
  McpScope.writeInvitations,
  McpScope.writeCard,
  'offline_access'
];
const apps = connectedApps(db);
// Signature, issuer, audience, and expiry are already verified; these are the claims tools rely on.
const accessToken = z.object({
  sub: z.string().min(1),
  azp: z.string().min(1),
  scope: z.string().default(''),
  exp: z.number().optional()
});

const handle = requireMcpAuth(
  auth,
  async (request, payload) => {
    const claims = accessToken.parse(payload);
    // A disconnected app's access token stays cryptographically valid until it expires.
    if (!(await apps.isConnected(claims.sub, claims.azp))) return disconnected();
    const mcp = createMcpHandler(
      () =>
        contactsMcpServer({
          db,
          ownerId: claims.sub,
          clientId: claims.azp,
          invitationLink: (token, slug) => invitationUrl(token, origin, slug),
          // The CIMD transport resolves DNS once, refuses non-public addresses, and never redirects.
          fetchPhoto: fetchClientMetadataResource,
          icons: Discovery.icons(origin)
        }),
      // Serves MCP 2026-07-28 and, statelessly, the 2025 revisions most clients still default to.
      // Either way each request stands alone, so no session store is needed.
      { legacy: 'stateless' }
    );
    return mcp.fetch(request, {
      authInfo: {
        token: request.headers.get('authorization')?.replace(/^\S+\s+/, '') ?? '',
        clientId: claims.azp,
        scopes: claims.scope.split(' ').filter(Boolean),
        expiresAt: claims.exp,
        resource: new URL(mcpResource),
        resourceMetadataUrl
      }
    });
  },
  {
    resource: mcpResource,
    requiredScopes: [McpScope.readContacts],
    // Clients request the challenged scopes, and refresh tokens are only issued with offline_access.
    challengeScopes
  }
);

/** The same challenge as a missing token, so the client starts authorization again. */
const disconnected = () =>
  Response.json(
    {
      jsonrpc: '2.0',
      error: { code: -32000, message: 'This app was disconnected from Contacts Exchange.' },
      id: null
    },
    {
      status: 401,
      headers: {
        'WWW-Authenticate': `Bearer error="invalid_token", error_description="The app was disconnected", resource_metadata="${resourceMetadataUrl}", scope="${challengeScopes.join(' ')}"`
      }
    }
  );

export const POST = ({ request }) => handle(request);
