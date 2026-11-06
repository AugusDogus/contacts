import { describe, expect, test } from 'bun:test';
import { Discovery } from './discovery';

const origin = 'https://contacts.exchange';

describe('integrations.sh discovery documents', () => {
  test('integrations.json declares the MCP server as self-onboarding OAuth', () => {
    const doc = Discovery.integrations(origin);
    const self = `${origin}/.well-known/integrations.json`;
    expect(doc.version).toBe(3);
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

  test('the server card names the endpoint, transport, and authorization server', () => {
    expect(Discovery.serverCard(origin)).toMatchObject({
      url: `${origin}/mcp`,
      transport: 'streamable-http',
      authentication: { type: 'oauth2', authorization_server: `${origin}/api/auth` }
    });
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
