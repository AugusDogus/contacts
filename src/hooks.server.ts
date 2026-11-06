import { building, dev } from '$app/env';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { auth } from '#lib/server/auth.ts';
import { Csrf } from '#lib/server/csrf.ts';
import { PublicDocument } from '#lib/server/public-document.ts';
import { addressBook } from '#lib/server/address-book.ts';
import { db } from '#lib/server/db.ts';
import { createDemo } from '#lib/server/demo.ts';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_CONTACTS_DOMAIN } from '$app/env/public';
import { BETTER_AUTH_URL } from '$app/env/private';

export const handle: Handle = async ({ event, resolve }) => {
  if (building) return resolve(event);
  // Replaces SvelteKit's own check, which also blocked OAuth token exchanges; see csrf.ts.
  if (!dev && Csrf.isForbidden(event.request)) return Csrf.response(event.request);
  if (
    event.url.hostname.endsWith(`.${PUBLIC_CONTACTS_DOMAIN}`) &&
    [
      '/login',
      '/consent',
      '/api/auth',
      '/invitations',
      '/page',
      '/settings',
      '/google',
      '/export'
    ].some((path) => event.url.pathname === path || event.url.pathname.startsWith(`${path}/`))
  ) {
    redirect(303, `${BETTER_AUTH_URL}${event.url.pathname}${event.url.search}`, {
      external: [new URL(BETTER_AUTH_URL).origin]
    });
  }
  const session = await auth.api.getSession({ headers: event.request.headers });
  event.locals.viewer = session
    ? { id: session.user.id, name: session.user.name, email: session.user.email, kind: 'account' }
    : null;
  const book = addressBook(db);
  if (session) await book.ensureProfile(session.user.id, session.user.name);
  // Demo identities exist only in the Vite dev server and are isolated by an unguessable cookie.
  if (dev && !session) {
    let demoId = event.cookies.get('gather-demo');
    if (event.url.pathname === '/' && (!demoId || !(await book.profile(demoId)))) {
      demoId = await createDemo();
      event.cookies.set('gather-demo', demoId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: event.url.protocol === 'https:',
        maxAge: 7 * 86_400
      });
    }
    if (demoId?.startsWith('demo-') && (await book.profile(demoId))) {
      event.locals.viewer = {
        id: demoId,
        name: 'Augie',
        email: 'Local demo workspace',
        kind: 'demo'
      };
    }
  }
  const response = await svelteKitHandler({ event, resolve, auth, building });
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  // Public discovery documents choose their own caching; everything else is per-viewer.
  if (!(PublicDocument.isPublicPath(event.url.pathname) && response.headers.has('Cache-Control')))
    response.headers.set('Cache-Control', 'private, no-store');
  return response;
};
