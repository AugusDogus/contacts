import { describe, expect, test } from 'bun:test';
import { Discovery } from './discovery';

const origin = 'https://contacts.exchange';

describe('integrations.sh discovery documents', () => {
  test('integrations.json declares the MCP server as self-onboarding OAuth', () => {
    const doc = Discovery.integrations(origin);
    const self = `${origin}/.well-known/integrations.json`;
    expect(doc.version).toBe(3);
    expect(doc.summary).toStartWith(
      `Contacts Exchange exposes an OAuth-protected MCP server at \`${origin}/mcp\``
    );
    expect(doc.surfaces).toHaveLength(1);
    const [mcp] = doc.surfaces;
    expect(mcp).toMatchObject({
      type: 'mcp',
      url: `${origin}/mcp`,
      transports: ['streamable-http'],
      basis: { via: 'declared', source: self }
    });
    if (mcp?.auth.status !== 'required') throw new Error('MCP surface must require auth');
    const uses = mcp.auth.entries.flatMap((entry) => {
      expect(entry.basis).toEqual({ via: 'declared', source: self });
      return entry.use;
    });
    expect(uses).toEqual([
      { id: 'contacts_exchange_account', mechanics: { source: 'well-known' } }
    ]);
    expect(doc.credentials.contacts_exchange_account?.type).toBe('oauth2');
  });

  test('the server card follows the official MCP format and keeps the fields integrations.sh reads', () => {
    const card = Discovery.serverCard(origin);
    expect(card).toMatchObject({
      $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
      name: 'exchange.contacts/address-book',
      title: 'Contacts Exchange',
      websiteUrl: origin,
      remotes: [{ type: 'streamable-http', url: `${origin}/mcp` }],
      url: `${origin}/mcp`,
      transport: 'streamable-http',
      authentication: { type: 'oauth2', authorization_server: `${origin}/api/auth` }
    });
    // Reverse-DNS with exactly one slash, as the official schema requires.
    expect(card.name).toMatch(/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/);
    expect(card.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(card.description.length).toBeLessThanOrEqual(100);
  });

  test('the AI catalog points at the server card hosted under the MCP endpoint', () => {
    expect(Discovery.aiCatalog(origin)).toEqual({
      specVersion: '1.0',
      entries: [
        {
          identifier: 'urn:air:contacts.exchange:mcp:address-book',
          type: 'application/mcp-server-card+json',
          url: `${origin}/mcp/server-card`
        }
      ]
    });
  });

  test('llms.txt says when an agent should use Contacts Exchange', () => {
    expect(Discovery.llmsTxt(origin)).toContain('## When to use Contacts Exchange');
  });

  test('llms.txt follows the llmstxt.org shape and points at the MCP endpoint', () => {
    const text = Discovery.llmsTxt(origin);
    expect(text.startsWith('# Contacts Exchange\n\n> ')).toBe(true);
    expect(text).toContain(`${origin}/mcp`);
    expect(text).toContain(`${origin}/.well-known/oauth-protected-resource/mcp`);
  });

  test('documents follow the configured origin, not the production domain', () => {
    expect(JSON.stringify(Discovery.integrations('http://localhost:5173'))).not.toContain(
      'contacts.exchange'
    );
  });
});
