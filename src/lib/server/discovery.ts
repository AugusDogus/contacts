/**
 * Machine-readable descriptions of the MCP server for registries such as integrations.sh.
 * Every URL derives from the configured origin, so dev and preview builds describe themselves.
 * See https://integrations.sh/publishing/ for the formats.
 */

/** Marks a fact as published by us, pointing at our own integrations.json. */
type Declared = { via: 'declared'; source: string };

/** The subset of the integrations.sh v3 owner schema these documents use. */
export type IntegrationsDocument = {
  version: 3;
  summary: string;
  credentials: Record<string, { type: 'oauth2'; label: string; setup: string }>;
  surfaces: {
    type: 'mcp';
    slug: string;
    name: string;
    url: string;
    transports: ['streamable-http'];
    basis: Declared;
    auth:
      | { status: 'none'; basis: Declared }
      | {
          status: 'required';
          // `well-known`: OAuth is resolved from the surface URL via RFC 9728 and RFC 8414.
          entries: {
            use: { id: string; mechanics: { source: 'well-known' } }[];
            basis: Declared;
          }[];
        };
  }[];
};

const credentialId = 'contacts_exchange_account';
const mcpUrl = (origin: string) => `${origin}/mcp`;

export const Discovery = {
  integrations(origin: string): IntegrationsDocument {
    const basis: Declared = { via: 'declared', source: `${origin}/.well-known/integrations.json` };
    return {
      version: 3,
      // Registry convention: name each surface and where it lives, then how auth works.
      summary: `Contacts Exchange exposes an OAuth-protected MCP server at \`${mcpUrl(origin)}\`; apps register themselves and the user approves access.`,
      credentials: {
        [credentialId]: {
          type: 'oauth2',
          label: 'Contacts Exchange account',
          setup:
            'Add the MCP server URL to your AI app. The app registers itself and opens Contacts Exchange, where you sign in and approve access. There is nothing to create or copy.'
        }
      },
      surfaces: [
        {
          type: 'mcp',
          slug: 'contacts-exchange-mcp',
          name: 'Contacts Exchange MCP server',
          url: mcpUrl(origin),
          transports: ['streamable-http'],
          basis,
          auth: {
            status: 'required',
            entries: [{ use: [{ id: credentialId, mechanics: { source: 'well-known' } }], basis }]
          }
        }
      ]
    };
  },

  /** MCP server card (SEP-1649). */
  serverCard(origin: string) {
    return {
      url: mcpUrl(origin),
      name: 'Contacts Exchange',
      description:
        'Read the address book your friends filled in, create invitation links, and edit your own contact card.',
      transport: 'streamable-http',
      authentication: { type: 'oauth2', authorization_server: `${origin}/api/auth` }
    } as const;
  },

  /** llms.txt (llmstxt.org): plain-language context for agents. */
  llmsTxt(origin: string) {
    return `# Contacts Exchange

> An address book your friends fill in. Send someone a private link, they add their own details, and you export everyone to Google Contacts or a vCard file.

Contacts Exchange has a remote MCP server, so AI apps can read your address book, create invitation links for you, and edit your own contact card.

## MCP server

- Endpoint: ${mcpUrl(origin)} (Streamable HTTP)
- Authorization: OAuth 2.1. Apps register with a Client ID Metadata Document, then you sign in to Contacts Exchange and approve access. Metadata: ${origin}/.well-known/oauth-protected-resource/mcp
- Scopes: contacts:read (every tool), invitations:write (creating invitation links), card:write (editing your own card), offline_access (staying connected)

## Pages

- [About](${origin}/about): How invitation links and exports work
- [Privacy](${origin}/privacy): What is stored, how it is used, and Google account access
`;
  }
} as const;
