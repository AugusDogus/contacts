import { command, getRequestEvent } from '$app/server';
import { z } from 'zod';
import { contactInput } from './contact';
import { addressBook } from './server/address-book';
import { db } from './server/db';
import { normalizePhoto } from './server/photo';
import { claimCookieDomain } from './server/claim-cookie';
import { checkInvitationAccess } from './server/invitation-access';
import { invitationTokenPattern } from './invitation-token';
import { FormConfig } from './form-config';

const submission = z.object({
  slug: z.string().max(40),
  token: z.string().regex(invitationTokenPattern),
  contact: contactInput,
  consent: z.literal(true)
});
// The first request in a fresh serverless instance also pays for loading the app and sharp.
let warm = false;

export const submitContact = command(submission, async (input) => {
  const started = performance.now();
  const cold = !warm;
  warm = true;
  const result = await submit(input);
  // Timing only, never contact details, so slow submissions can be diagnosed from logs.
  console.info(
    `submitContact ${result.ok ? 'ok' : 'rejected'} in ${Math.round(performance.now() - started)}ms (photo: ${Boolean(input.contact.photo)}, cold: ${cold})`
  );
  return result;
});

async function submit({ slug, token, contact }: z.infer<typeof submission>) {
  await checkInvitationAccess(db, getRequestEvent().getClientAddress());
  const book = addressBook(db);
  const [invitation, owner] = await Promise.all([
    book.invitation(token, slug),
    book.publicProfile(slug)
  ]);
  if (!invitation || !owner)
    return {
      ok: false,
      message: 'This invitation is no longer available. Ask your friend for a new link.'
    } as const;
  const form = FormConfig.parse(owner.form);
  const answered = { ...contact, custom: FormConfig.answers(form, contact.custom) };
  const missing = FormConfig.missing(form, answered);
  if (missing) return { ok: false, message: missing.message } as const;
  const normalized = await normalizePhoto(answered.photo);
  if (!normalized.ok) return normalized;
  const result = await book.submit(token, slug, { ...answered, photo: normalized.photo });
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
