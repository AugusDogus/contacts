import { error, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { verifyOAuthQueryParams } from '@better-auth/oauth-provider';
import { eq } from 'drizzle-orm';
import { auth } from '#lib/server/auth.ts';
import { db } from '#lib/server/db.ts';
import { savedCards, user } from '#lib/server/schema.ts';
import { Contact, contactInput, type ContactInput } from '#lib/contact.ts';
import { McpScope } from '#lib/server/mcp-scope.ts';

const scopeDescriptions: Record<string, string> = {
  openid: 'Confirm who you are',
  profile: 'See your name',
  email: 'See your email address',
  offline_access: 'Stay connected while you keep using it',
  [McpScope.readContacts]: 'Read the contacts in your address book',
  [McpScope.writeInvitations]: 'Create invitation links for you'
};

const httpsOnly = (value: string | null | undefined) =>
  value?.startsWith('https:') ? value : null;

/** Who is granting access: the owner's own card if they made one, else their account. */
async function accountPerson(userId: string, fallbackName: string): Promise<ContactInput> {
  const [account, saved] = await Promise.all([
    db.query.user.findFirst({ where: eq(user.id, userId), columns: { name: true, image: true } }),
    db.query.savedCards.findFirst({ where: eq(savedCards.userId, userId) })
  ]);
  if (saved) return contactInput.parse(saved.data);
  const [firstName = '', ...rest] = (account?.name || fallbackName).trim().split(/\s+/);
  return {
    ...Contact.empty(),
    firstName,
    lastName: rest.join(' '),
    photo: httpsOnly(account?.image) ?? ''
  };
}

export const load = async ({ locals, url, request }) => {
  if (locals.viewer?.kind !== 'account') redirect(303, '/login?signin');
  const params = url.searchParams;
  const signed = new Set(['sig', 'ba_param', ...params.getAll('ba_param')]);
  const query = new URLSearchParams([...params].filter(([key]) => signed.has(key)));
  const { secret } = await auth.$context;
  if (!(await verifyOAuthQueryParams(query.toString(), secret)))
    error(400, 'This authorization link is invalid or expired. Start connecting the app again.');
  const clientId = query.get('client_id');
  const redirectUri = query.get('redirect_uri');
  if (!clientId || !redirectUri)
    error(400, 'This authorization request is missing the app or its return address.');
  try {
    const client = await auth.api.getOAuthClientPublic({
      query: { client_id: clientId },
      headers: request.headers
    });
    return {
      viewer: locals.viewer,
      person: await accountPerson(locals.viewer.id, locals.viewer.name),
      // Registrant-chosen names can impersonate anyone, so the return host is always shown too.
      client: {
        name: client.client_name || 'An unnamed app',
        uri: httpsOnly(client.client_uri),
        redirectHost: new URL(redirectUri).host
      },
      scopes: (query.get('scope') ?? '')
        .split(' ')
        .filter(Boolean)
        .map((scope) => ({ scope, description: scopeDescriptions[scope] ?? scope }))
    };
  } catch (cause) {
    if (cause instanceof APIError && cause.statusCode === 404)
      error(404, 'This app is not registered or has been disabled.');
    throw cause;
  }
};
