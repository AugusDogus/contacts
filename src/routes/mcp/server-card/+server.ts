import { mcpResource } from '#lib/server/auth.ts';
import { Discovery } from '#lib/server/discovery.ts';
import { PublicDocument } from '#lib/server/public-document.ts';

// The location SEP-2127 reserves for a server's card: its streamable-HTTP URL plus /server-card.
export const GET = () =>
  PublicDocument.json(
    Discovery.serverCard(new URL(mcpResource).origin),
    'application/mcp-server-card+json'
  );
