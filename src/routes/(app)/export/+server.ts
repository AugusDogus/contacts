import { error } from '@sveltejs/kit';
import { addressBook } from '#lib/server/address-book.ts';
import { db } from '#lib/server/db.ts';
import { toVCard } from '#lib/vcard.ts';

export const GET = async ({ locals, url }) => {
  if (!locals.viewer) error(401, 'Sign in to download your contacts.');
  const selected = url.searchParams.getAll('id');
  const contacts = (await addressBook(db).contacts(locals.viewer.id)).filter(
    (contact) => selected.length === 0 || selected.includes(contact.id)
  );
  return new Response(toVCard(contacts), {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="gather-contacts.vcf"',
      'Cache-Control': 'private, no-store'
    }
  });
};
