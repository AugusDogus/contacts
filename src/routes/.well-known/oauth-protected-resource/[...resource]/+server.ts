import { auth } from '#lib/server/auth.ts';

// The MCP plugin answers RFC 9728 metadata itself, but only for requests routed to Better Auth.
export const GET = async ({ request }) => {
  const response = await auth.handler(request);
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
};
