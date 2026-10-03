import { error, redirect } from '@sveltejs/kit';
import { invitationTokenPattern } from '#lib/invitation-token.ts';
import { contactPageUrl } from '#lib/links.ts';
import { addressBook } from '#lib/server/address-book.ts';
import { db } from '#lib/server/db.ts';

export const load = async ({ params, url }) => {
  if (!invitationTokenPattern.test(params.token))
    error(404, 'This invitation could not be found. Ask your friend for a new link.');
  const slug = await addressBook(db).invitationPage(params.token);
  if (!slug) error(404, 'This invitation could not be found. Ask your friend for a new link.');
  redirect(307, `${contactPageUrl(slug, url.origin)}/i/${params.token}`);
};
