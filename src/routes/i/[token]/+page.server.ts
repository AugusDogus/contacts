import { checkInvitationAccess } from '#lib/server/invitation-access.ts';
import { error, redirect } from '@sveltejs/kit';
import { invitationTokenPattern } from '#lib/invitation-token.ts';
import { contactPageUrl } from '#lib/links.ts';
import { addressBook } from '#lib/server/address-book.ts';
import { db } from '#lib/server/db.ts';

export const load = async ({ params, url, getClientAddress }) => {
  if (!invitationTokenPattern.test(params.token))
    error(404, 'This invitation could not be found. Ask your friend for a new link.');
  await checkInvitationAccess(db, getClientAddress());
  const slug = await addressBook(db).invitationPage(params.token);
  if (!slug) error(404, 'This invitation could not be found. Ask your friend for a new link.');
  const pageUrl = contactPageUrl(slug, url.origin);
  redirect(307, `${pageUrl}/i/${params.token}`, { external: [new URL(pageUrl).origin] });
};
