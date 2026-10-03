import { command, getRequestEvent } from '$app/server';
import { z } from 'zod';
import { contactInput } from './contact';
import { addressBook } from './server/address-book';
import { db } from './server/db';
import { normalizePhoto } from './server/photo';
import { claimCookieDomain } from './server/claim-cookie';
import { checkInvitationAccess } from './server/invitation-access';
import { invitationTokenPattern } from './invitation-token';

export const submitContact = command(
  z.object({
    slug: z.string().max(40),
    token: z.string().regex(invitationTokenPattern),
    contact: contactInput,
    consent: z.literal(true)
  }),
  async ({ slug, token, contact }) => {
    await checkInvitationAccess(db, getRequestEvent().getClientAddress());
    const book = addressBook(db);
    if (!(await book.invitation(token, slug)))
      return {
        ok: false,
        message: 'This invitation is no longer available. Ask your friend for a new link.'
      } as const;
    const normalized = await normalizePhoto(contact.photo);
    if (!normalized.ok) return normalized;
    const result = await book.submit(token, slug, { ...contact, photo: normalized.photo });
    if (!result.ok) return result;
    const { cookies, url } = getRequestEvent();
    cookies.set('gather-claim', result.receipt, {
      path: '/',
      domain: claimCookieDomain(url.hostname),
      httpOnly: true,
      secure: url.protocol === 'https:',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60
    });
    return { ok: true } as const;
  }
);
