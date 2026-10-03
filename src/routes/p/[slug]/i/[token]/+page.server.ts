import { checkInvitationAccess } from '#lib/server/invitation-access.ts';
import { error } from '@sveltejs/kit';
import { addressBook } from '#lib/server/address-book.ts';
import { db } from '#lib/server/db.ts';
import { savedCards } from '#lib/server/schema.ts';
import { eq } from 'drizzle-orm';
import { invitationTokenPattern } from '#lib/invitation-token.ts';
export const load = async ({ params, locals, getClientAddress }) => {
  await checkInvitationAccess(db, getClientAddress());
  const book = addressBook(db);
  const profile = await book.publicProfile(params.slug);
  if (!profile) error(404, 'This contact page does not exist. Check the link with your friend.');
  const valid =
    invitationTokenPattern.test(params.token) &&
    Boolean(await book.invitation(params.token, params.slug));
  const saved =
    locals.viewer?.kind === 'account'
      ? await db.query.savedCards.findFirst({ where: eq(savedCards.userId, locals.viewer.id) })
      : null;
  return {
    profile: { name: profile.name, message: profile.message, slug: profile.slug },
    valid,
    token: params.token,
    savedCard: saved?.data ?? null
  };
};
