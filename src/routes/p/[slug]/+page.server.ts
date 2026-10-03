import { error } from '@sveltejs/kit';
import { addressBook } from '#lib/server/address-book.ts';
import { db } from '#lib/server/db.ts';
export const load = async ({ params }) => {
  const profile = await addressBook(db).publicProfile(params.slug);
  if (!profile) error(404, 'This contact page does not exist. Check the link with your friend.');
  return { profile: { name: profile.name, message: profile.message, slug: profile.slug } };
};
