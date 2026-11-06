import { mcpResource } from '#lib/server/auth.ts';
import { Crawl } from '#lib/server/crawl.ts';
import { PublicDocument } from '#lib/server/public-document.ts';

export const GET = () => PublicDocument.text(Crawl.robotsTxt(new URL(mcpResource).origin));
