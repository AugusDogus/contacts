/** Documents for search crawlers: robots.txt and the sitemap of public pages. */

/** Public pages worth indexing. Everything else is signed-in, per-person, or an API. */
const pages = ['/', '/about', '/privacy'] as const;

/** Signed-in app pages and APIs; they redirect or answer with errors when crawled. */
const disallowed = [
  '/api/',
  '/people',
  '/settings',
  '/google',
  '/export',
  '/consent',
  '/invitations'
] as const;

export const Crawl = {
  pages,
  robotsTxt: (origin: string) =>
    [
      'User-agent: *',
      ...disallowed.map((path) => `Disallow: ${path}`),
      '',
      `Sitemap: ${origin}/sitemap.xml`,
      ''
    ].join('\n'),
  sitemapXml: (origin: string) =>
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...pages.map((path) => `  <url><loc>${origin}${path}</loc></url>`),
      '</urlset>',
      ''
    ].join('\n')
} as const;
