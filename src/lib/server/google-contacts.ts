import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Contact } from '../contact';
import { GooglePerson, type Decisions, type PersonField } from '../google-person';
import type { AppDatabase } from './db';
import { googleImports } from './schema';

type Request = (url: string, init: RequestInit) => Promise<Response>;
export type ImportResult =
  | { status: 'imported'; photoSkipped: boolean; person: GooglePerson }
  | { status: 'merged'; photoSkipped: boolean; person: GooglePerson }
  /** Already reserved, by an earlier export or a repeat of this request; `previous` is its state. */
  | { status: 'skipped'; previous: 'pending' | 'done' | 'merged' | 'uncertain' }
  /** `fatal` failures (access denied, rate limited) affect every card, so the run stops. */
  | { status: 'failed'; message: string; fatal: boolean };

const api = 'https://people.googleapis.com/v1';
const personFields = (
  [
    'names',
    'nicknames',
    'emailAddresses',
    'phoneNumbers',
    'addresses',
    'birthdays',
    'organizations',
    'urls',
    'biographies',
    'userDefined',
    'photos'
  ] satisfies PersonField[]
).join(',');
const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});
/** Google's own explanation of a failed request, such as "Invalid birthday". */
async function reason(response: Response) {
  const body = z
    .object({ error: z.object({ message: z.string() }) })
    .safeParse(await response.json().catch(() => null));
  return body.success ? body.data.error.message : '';
}
const fatal = (status: number) => status === 401 || status === 403 || status === 429;
const deniedMessage =
  'Google denied access. Reconnect your Google account and grant Contacts access, then try again. Your contacts are still saved here.';

/** Every contact in the signed-in Google account, so cards can be matched before adding. */
export async function listGooglePeople(
  token: string,
  request: Request = fetch
): Promise<{ ok: true; people: GooglePerson[] } | { ok: false; message: string }> {
  const people: GooglePerson[] = [];
  let pageToken = '';
  do {
    const url = `${api}/people/me/connections?personFields=${personFields}&pageSize=1000${pageToken ? `&pageToken=${pageToken}` : ''}`;
    let response: Response;
    try {
      response = await request(url, {
        headers: headers(token),
        signal: AbortSignal.timeout(8_000)
      });
    } catch {
      return {
        ok: false,
        message:
          'Couldn’t reach Google to check for existing contacts. Nothing was added. Try again.'
      };
    }
    if (!response.ok)
      return {
        ok: false,
        message:
          response.status === 401 || response.status === 403
            ? deniedMessage
            : `Google couldn’t list your contacts (HTTP ${response.status}). Nothing was added. Try again.`
      };
    const page = z
      .object({
        connections: z.array(z.unknown()).optional(),
        nextPageToken: z.string().optional()
      })
      .safeParse(await response.json().catch(() => null));
    if (!page.success)
      return {
        ok: false,
        message: 'Google returned an unreadable contact list. Nothing was added. Try again.'
      };
    for (const entry of page.data.connections ?? []) {
      const person = GooglePerson.schema.safeParse(entry);
      if (person.success) people.push(person.data);
    }
    pageToken = page.data.nextPageToken ?? '';
  } while (pageToken);
  return { ok: true, people };
}

async function uploadPhoto(resourceName: string, photo: string, token: string, request: Request) {
  try {
    const response = await request(`${api}/${resourceName}:updateContactPhoto`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify({ photoBytes: photo.split(',')[1] }),
      signal: AbortSignal.timeout(5_000)
    });
    return !response.ok;
  } catch {
    return true;
  }
}

type Target = {
  accountId: string;
  token: string;
  /** The account's current contacts. Callers should apply returned people to it. */
  people: GooglePerson[];
  /** How to settle details the matching Google contact has with different values. */
  decisions?: Decisions;
};

/** Adds a card to Google, or merges it into the matching Google contact. */
export async function importGoogleContact(
  db: AppDatabase,
  contact: Contact,
  { accountId, token, people, decisions = {} }: Target,
  request: Request = fetch
): Promise<ImportResult> {
  const key = and(eq(googleImports.contactId, contact.id), eq(googleImports.accountId, accountId));
  const reservation = await db
    .insert(googleImports)
    .values({ contactId: contact.id, accountId, status: 'pending' })
    .onConflictDoNothing()
    .returning();
  if (!reservation.length) {
    const [previous] = await db
      .select({ status: googleImports.status })
      .from(googleImports)
      .where(key);
    return { status: 'skipped', previous: previous?.status ?? 'pending' };
  }
  const existing = GooglePerson.match(contact.data, people);
  return existing
    ? mergeInto(existing, decisions, db, contact, key, token, request)
    : create(db, contact, key, token, request);
}

async function mergeInto(
  existing: GooglePerson,
  decisions: Decisions,
  db: AppDatabase,
  contact: Contact,
  key: ReturnType<typeof and>,
  token: string,
  request: Request
): Promise<ImportResult> {
  const plan = GooglePerson.merge(contact.data, existing, decisions);
  let person = existing;
  if (plan.fields.length) {
    // Each write sets fields to fixed values, so any failure can safely be retried.
    let response: Response;
    try {
      response = await request(
        `${api}/${existing.resourceName}:updateContact?updatePersonFields=${plan.fields.join(',')}&personFields=${personFields}`,
        {
          method: 'PATCH',
          headers: headers(token),
          body: JSON.stringify(plan.update),
          signal: AbortSignal.timeout(10_000)
        }
      );
    } catch (error) {
      console.error(
        `updateContact for contact ${contact.id} (${existing.resourceName}) got no response:`,
        error
      );
      await db.delete(googleImports).where(key);
      return {
        status: 'failed',
        fatal: false,
        message: `Google didn’t respond in time, so it’s unclear whether ${contact.data.firstName}’s contact was updated. Trying again is safe.`
      };
    }
    if (!response.ok) {
      const detail = await reason(response);
      console.error(
        `updateContact for contact ${contact.id} (${existing.resourceName}) failed: HTTP ${response.status} ${detail}; fields ${plan.fields.join(',')}`
      );
      await db.delete(googleImports).where(key);
      return {
        status: 'failed',
        fatal: fatal(response.status),
        message:
          response.status === 401 || response.status === 403
            ? deniedMessage
            : response.status === 429
              ? 'Google is receiving too many requests. Wait a minute, then try again.'
              : `Google rejected the update${detail ? `: “${detail}”` : ` (HTTP ${response.status})`}. ${contact.data.firstName}’s Google contact was left unchanged.`
      };
    }
    // Google applied the update even if its reply can't be read, so this still counts as merged.
    const updated = GooglePerson.schema.safeParse(await response.json().catch(() => null));
    if (updated.success) person = updated.data;
    else
      console.error(
        `updateContact for contact ${contact.id} (${existing.resourceName}) returned an unreadable person`,
        updated.error.issues.slice(0, 3)
      );
  }
  const photoSkipped = plan.addPhoto
    ? await uploadPhoto(existing.resourceName, contact.data.photo, token, request)
    : false;
  await db
    .update(googleImports)
    .set({ status: 'merged', resourceName: existing.resourceName })
    .where(key);
  return { status: 'merged', photoSkipped, person };
}

async function create(
  db: AppDatabase,
  contact: Contact,
  key: ReturnType<typeof and>,
  token: string,
  request: Request
): Promise<ImportResult> {
  let response: Response;
  try {
    response = await request(`${api}/people:createContact?personFields=${personFields}`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(GooglePerson.from(contact.data)),
      signal: AbortSignal.timeout(8_000)
    });
  } catch {
    await db.update(googleImports).set({ status: 'uncertain' }).where(key);
    console.error(`createContact for contact ${contact.id} got no response`);
    return {
      status: 'failed',
      fatal: false,
      message:
        'Google’s response was interrupted. Check Google Contacts before retrying this card. Your original contact is still saved here.'
    };
  }
  if (!response.ok) {
    const detail = await reason(response);
    console.error(
      `createContact for contact ${contact.id} failed: HTTP ${response.status} ${detail}`
    );
    const safeToRetry = [400, 401, 403, 404, 429].includes(response.status);
    if (safeToRetry) await db.delete(googleImports).where(key);
    else await db.update(googleImports).set({ status: 'uncertain' }).where(key);
    return {
      status: 'failed',
      fatal: fatal(response.status),
      message:
        response.status === 401 || response.status === 403
          ? deniedMessage
          : response.status === 429
            ? 'Google is receiving too many requests. Wait a minute, then import the remaining contacts.'
            : safeToRetry
              ? `Google rejected this contact${detail ? `: “${detail}”` : ` (HTTP ${response.status})`}. Nothing was added.`
              : `Google could not confirm this import (HTTP ${response.status}). Check Google Contacts before trying again. Your original contact is still saved here.`
    };
  }
  const parsed = GooglePerson.schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    await db.update(googleImports).set({ status: 'uncertain' }).where(key);
    console.error(`createContact for contact ${contact.id} returned an unreadable person`);
    return {
      status: 'failed',
      fatal: false,
      message:
        'Google accepted the request but returned an unreadable receipt. Check Google Contacts before retrying this card.'
    };
  }
  await db
    .update(googleImports)
    .set({ status: 'done', resourceName: parsed.data.resourceName })
    .where(key);
  const photoSkipped = contact.data.photo
    ? await uploadPhoto(parsed.data.resourceName, contact.data.photo, token, request)
    : false;
  return { status: 'imported', photoSkipped, person: parsed.data };
}
