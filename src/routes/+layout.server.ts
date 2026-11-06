import { googleConfigured, mcpResource } from '#lib/server/auth.ts';
// The site's own origin, for links that must point at the main site (footers on
// people's subdomains, canonical URLs, social cards).
export const load = () => ({ googleConfigured, appUrl: new URL(mcpResource).origin });
