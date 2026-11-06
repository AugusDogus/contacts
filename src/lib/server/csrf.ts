/**
 * SvelteKit's cross-site form check, minus the OAuth endpoints that clients call from their own
 * servers. RFC 6749 requires form-encoded bodies there, and those requests carry no Origin or a
 * foreign one, so SvelteKit's built-in check (disabled in vite.config.ts) refused every token
 * exchange. They authenticate the client with PKCE or credentials, never a browser cookie, so a
 * forged cross-site form gains nothing.
 */
const serverToServer = new Set([
  '/api/auth/oauth2/token',
  '/api/auth/oauth2/revoke',
  '/api/auth/oauth2/introspect'
]);
const mutating = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
// The content types a plain HTML form can send cross-site without a CORS preflight.
const formTypes = new Set([
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain'
]);

export const Csrf = {
  isForbidden(request: Request): boolean {
    if (!mutating.has(request.method)) return false;
    const type = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
    if (type && !formTypes.has(type)) return false;
    const url = new URL(request.url);
    if (serverToServer.has(url.pathname)) return false;
    return request.headers.get('origin') !== url.origin;
  },
  response(request: Request): Response {
    const message = `Cross-site ${request.method} form submissions are forbidden`;
    return request.headers.get('accept') === 'application/json'
      ? Response.json({ message }, { status: 403 })
      : new Response(message, { status: 403 });
  }
} as const;
