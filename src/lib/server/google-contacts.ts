import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Contact } from '../contact';
import { toGooglePerson } from '../google-person';
import type { AppDatabase } from './db';
import { googleImports } from './schema';

export type ImportResult =
  | { status: 'imported'; photoSkipped: boolean }
  | { status: 'skipped' }
  | { status: 'failed'; message: string };

export async function importGoogleContact(
  db: AppDatabase,
  contact: Contact,
  accountId: string,
  accessToken: string,
  request: (url: string, init: RequestInit) => Promise<Response> = fetch
): Promise<ImportResult> {
  const key = and(eq(googleImports.contactId, contact.id), eq(googleImports.accountId, accountId));
  const reservation = await db
    .insert(googleImports)
    .values({ contactId: contact.id, accountId, status: 'pending' })
    .onConflictDoNothing()
    .returning();
  if (!reservation.length) return { status: 'skipped' };
  let response: Response;
  try {
    response = await request('https://people.googleapis.com/v1/people:createContact', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(toGooglePerson(contact.data)),
      signal: AbortSignal.timeout(8_000)
    });
  } catch {
    await db.update(googleImports).set({ status: 'uncertain' }).where(key);
    return {
      status: 'failed',
      message:
        'Google’s response was interrupted. Check Google Contacts before retrying this card. Your original contact is still saved here.'
    };
  }
  if (!response.ok) {
    const safeToRetry = [400, 401, 403, 404, 429].includes(response.status);
    if (safeToRetry) await db.delete(googleImports).where(key);
    else await db.update(googleImports).set({ status: 'uncertain' }).where(key);
    return {
      status: 'failed',
      message:
        response.status === 401 || response.status === 403
          ? 'Google denied access. Reconnect your Google account and grant Contacts access, then try again. Your contacts are still saved here.'
          : response.status === 429
            ? 'Google is receiving too many requests. Wait a minute, then import the remaining contacts.'
            : `Google could not confirm this import (HTTP ${response.status}). Check Google Contacts before trying again. Your original contact is still saved here.`
    };
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  const parsed = z
    .object({ resourceName: z.string().regex(/^people\/[A-Za-z0-9_-]+$/) })
    .safeParse(payload);
  if (!parsed.success) {
    await db.update(googleImports).set({ status: 'uncertain' }).where(key);
    return {
      status: 'failed',
      message:
        'Google accepted the request but returned an unreadable receipt. Check Google Contacts before retrying this card.'
    };
  }
  await db
    .update(googleImports)
    .set({ status: 'done', resourceName: parsed.data.resourceName })
    .where(key);
  let photoSkipped = false;
  if (contact.data.photo) {
    try {
      const photoResponse = await request(
        `https://people.googleapis.com/v1/${parsed.data.resourceName}:updateContactPhoto`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoBytes: contact.data.photo.split(',')[1] }),
          signal: AbortSignal.timeout(5_000)
        }
      );
      photoSkipped = !photoResponse.ok;
    } catch {
      photoSkipped = true;
    }
  }
  return { status: 'imported', photoSkipped };
}
