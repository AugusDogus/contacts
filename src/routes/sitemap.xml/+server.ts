import { mcpResource } from '#lib/server/auth.ts';
import { Crawl } from '#lib/server/crawl.ts';
import { PublicDocument } from '#lib/server/public-document.ts';

export const GET = () => PublicDocument.xml(Crawl.sitemapXml(new URL(mcpResource).origin));
