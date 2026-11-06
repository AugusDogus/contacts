/**
 * Headers for documents published for crawlers and registries. hooks.server.ts keeps a
 * Cache-Control set here on these paths instead of forcing `private, no-store`.
 */
const publicHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=3600'
};

export const PublicDocument = {
  /** Whether a path holds a public document whose own Cache-Control should be kept. */
  isPublicPath: (pathname: string) =>
    pathname.startsWith('/.well-known/') ||
    pathname === '/llms.txt' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/mcp/server-card',
  /** JSON with an optional specific media type, such as `application/ai-catalog+json`. */
  json: (body: unknown, contentType = 'application/json') =>
    new Response(JSON.stringify(body), {
      headers: { ...publicHeaders, 'Content-Type': contentType }
    }),
  text: (body: string) =>
    new Response(body, {
      headers: { ...publicHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
    }),
  xml: (body: string) =>
    new Response(body, {
      headers: { ...publicHeaders, 'Content-Type': 'application/xml; charset=utf-8' }
    })
} as const;
