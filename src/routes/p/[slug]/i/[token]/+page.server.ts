import { checkInvitationAccess } from '#lib/server/invitation-access.ts';
import { error, redirect } from '@sveltejs/kit';
import { addressBook } from '#lib/server/address-book.ts';
import { db } from '#lib/server/db.ts';
import { savedCards } from '#lib/server/schema.ts';
import { eq } from 'drizzle-orm';
import { invitationTokenPattern } from '#lib/invitation-token.ts';
import { invitationUrl } from '#lib/links.ts';
export const load = async ({ params, locals, url, getClientAddress }) => {
  await checkInvitationAccess(db, getClientAddress());
  const book = addressBook(db);
  const link = invitationTokenPattern.test(params.token)
    ? await book.invitationState(params.token)
    : null;
  // Links name the page they were sent from. Follow the owner's page if it was renamed since.
  if (link && link.slug !== params.slug) {
    const destination = invitationUrl(params.token, url.origin, link.slug);
    redirect(307, destination, { external: [new URL(destination).origin] });
  }
  const profile = await book.publicProfile(params.slug);
  if (!profile) error(404, 'This contact page does not exist. Check the link with your friend.');
  const saved =
    locals.viewer?.kind === 'account'
      ? await db.query.savedCards.findFirst({ where: eq(savedCards.userId, locals.viewer.id) })
      : null;
  return {
    profile: { name: profile.name, message: profile.message, slug: profile.slug },
    state: link?.state ?? 'closed',
    token: params.token,
    savedCard: saved?.data ?? null
  };
};
