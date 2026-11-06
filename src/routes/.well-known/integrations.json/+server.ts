import { mcpResource } from '#lib/server/auth.ts';
import { Discovery } from '#lib/server/discovery.ts';
import { PublicDocument } from '#lib/server/public-document.ts';

export const GET = () => PublicDocument.json(Discovery.integrations(new URL(mcpResource).origin));
