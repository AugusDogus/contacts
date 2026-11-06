import { mcpResource } from '#lib/server/auth.ts';
import { Discovery } from '#lib/server/discovery.ts';
import { PublicDocument } from '#lib/server/public-document.ts';

export const GET = () => PublicDocument.text(Discovery.llmsTxt(new URL(mcpResource).origin));
