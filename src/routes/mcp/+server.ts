import { requireMcpAuth } from '@better-auth/mcp';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { auth, mcpResource } from '#lib/server/auth.ts';
import { db } from '#lib/server/db.ts';
import { McpScope } from '#lib/server/mcp-scope.ts';
import { contactsMcpServer } from '#lib/server/mcp-server.ts';
import { invitationUrl } from '#lib/links.ts';

const origin = new URL(mcpResource).origin;
// Signature, issuer, audience, and expiry are already verified; these are the claims tools rely on.
const accessToken = z.object({
  sub: z.string().min(1),
  azp: z.string().min(1),
  scope: z.string().default(''),
  exp: z.number().optional()
});

const handle = requireMcpAuth(
  auth,
  (request, payload) => {
    const claims = accessToken.parse(payload);
    const mcp = createMcpHandler(
      () =>
        contactsMcpServer({
          db,
          ownerId: claims.sub,
          invitationLink: (token, slug) => invitationUrl(token, origin, slug)
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
        resourceMetadataUrl: `${origin}/.well-known/oauth-protected-resource/mcp`
      }
    });
  },
  {
    resource: mcpResource,
    requiredScopes: [McpScope.readContacts],
    challengeScopes: [McpScope.readContacts, McpScope.writeInvitations]
  }
);

export const POST = ({ request }) => handle(request);
