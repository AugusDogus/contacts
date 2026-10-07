import { command, getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { requireViewer } from './server/viewer';
import { auth, googleConfigured } from './server/auth';
import { db } from './server/db';
import { contacts, googleImports } from './server/schema';
import { addressBook } from './server/address-book';
import { importGoogleContact, listGooglePeople } from './server/google-contacts';
import { GooglePerson, type Row } from './google-person';

const contactsScope = 'https://www.googleapis.com/auth/contacts';
type Viewer = ReturnType<typeof requireViewer>;

export const getGoogleConnection = query(async () => {
  const viewer = requireViewer();
  if (viewer.kind === 'demo') return { status: 'demo' } as const;
  if (!googleConfigured) return { status: 'unavailable' } as const;
  const accounts = await auth.api.listUserAccounts({ headers: getRequestEvent().request.headers });
  const account = accounts.find(
    (account) => account.providerId === 'google' && account.scopes.includes(contactsScope)
  );
  if (!account) return { status: 'disconnected' } as const;
  const imports = await db
    .select({ contactId: googleImports.contactId, status: googleImports.status })
    .from(googleImports)
    .innerJoin(contacts, eq(contacts.id, googleImports.contactId))
    .where(and(eq(contacts.ownerId, viewer.id), eq(googleImports.accountId, account.accountId)));
  return { status: 'connected', imports } as const;
});

/** The connected Google account, a fresh access token, and its current contacts. */
async function connect(viewer: Viewer) {
  if (viewer.kind === 'demo' || !googleConfigured)
    return {
      ok: false,
      message: 'Sign in to an account with Google Contacts connected before exporting.'
    } as const;
  const headers = getRequestEvent().request.headers;
  const accounts = await auth.api.listUserAccounts({ headers });
  const account = accounts.find(
    (account) => account.providerId === 'google' && account.scopes.includes(contactsScope)
  );
  if (!account) return { ok: false, message: 'Connect Google Contacts before exporting.' } as const;
  let token: string;
  try {
    const result = await auth.api.getAccessToken({ headers, body: { accountId: account.id } });
    if (!result.accessToken)
      return {
        ok: false,
        message: 'Google did not return an access token. Reconnect your account.'
      } as const;
    token = result.accessToken;
  } catch {
    return {
      ok: false,
      message:
        'Google access expired and could not be renewed. Reconnect your account. Your contacts are still saved here.'
    } as const;
  }
  const listed = await listGooglePeople(token);
  if (!listed.ok) return listed;
  return { ok: true, accountId: account.accountId, token, people: listed.people } as const;
}

/** What an export would do, without writing anything, so differing details can be settled first. */
export const previewExport = command(z.array(z.string()).min(1).max(1000), async (ids) => {
  const viewer = requireViewer();
  const google = await connect(viewer);
  if (!google.ok) return google;
  const cards = (await addressBook(db).contacts(viewer.id)).filter((card) => ids.includes(card.id));
  // Everyone being exported, so the owner sees the full picture: people needing a choice first,
  // then other existing contacts, then new ones (described as a merge into an empty contact).
  const review: { contactId: string; match: 'existing' | 'new'; rows: Row[] }[] = cards.map(
    (card) => {
      const existing = GooglePerson.match(card.data, google.people);
      return existing
        ? {
            contactId: card.id,
            match: 'existing',
            rows: GooglePerson.merge(card.data, existing).rows
          }
        : {
            contactId: card.id,
            match: 'new',
            rows: GooglePerson.merge(card.data, { resourceName: 'people/new' }).rows
          };
    }
  );
  const rank = (entry: (typeof review)[number]) =>
    entry.match === 'new' ? 2 : entry.rows.some(GooglePerson.needsChoice) ? 0 : 1;
  review.sort((a, b) => rank(a) - rank(b));
  const created = review.filter((entry) => entry.match === 'new').length;
  return { ok: true, created, merged: cards.length - created, review } as const;
});

const resolution = z.enum(['google', 'card', 'both', 'nickname']);

/** What happened to one card in an export. */
export type ExportOutcome =
  | { contactId: string; status: 'added' | 'updated'; photoSkipped: boolean }
  | { contactId: string; status: 'skipped' }
  | { contactId: string; status: 'failed'; message: string };

export const importToGoogle = command(
  z.object({
    ids: z.array(z.string()).min(1).max(3),
    // Per contact, how to settle each detail Google already has with a different value.
    decisions: z.record(z.string(), z.record(z.string(), resolution))
  }),
  async ({ ids, decisions }) => {
    const viewer = requireViewer();
    const google = await connect(viewer);
    const outcomes: ExportOutcome[] = [];
    if (!google.ok) return { ok: false, message: google.message, outcomes } as const;
    const cards = (await addressBook(db).contacts(viewer.id)).filter((card) =>
      ids.includes(card.id)
    );
    // Google requires sequential writes for the same account. Keep each serverless batch small.
    for (const card of cards) {
      const result = await importGoogleContact(db, card, {
        accountId: google.accountId,
        token: google.token,
        people: google.people,
        decisions: decisions[card.id]
      });
      if (result.status === 'failed') {
        outcomes.push({ contactId: card.id, status: 'failed', message: result.message });
        // Access and rate-limit problems affect every card, so stop; others only this one.
        if (result.fatal) {
          await getGoogleConnection().refresh();
          return { ok: false, message: result.message, outcomes } as const;
        }
        continue;
      }
      if (result.status === 'skipped') {
        // A browser can resend this request after a dropped connection, so report what the
        // first attempt did rather than "already exported".
        outcomes.push(
          result.previous === 'done'
            ? { contactId: card.id, status: 'added', photoSkipped: false }
            : result.previous === 'merged'
              ? { contactId: card.id, status: 'updated', photoSkipped: false }
              : { contactId: card.id, status: 'skipped' }
        );
        continue;
      }
      // Keep the list current so later cards in this batch match what was just written.
      const index = google.people.findIndex(
        (person) => person.resourceName === result.person.resourceName
      );
      if (index === -1) google.people.push(result.person);
      else google.people[index] = result.person;
      outcomes.push({
        contactId: card.id,
        status: result.status === 'imported' ? 'added' : 'updated',
        photoSkipped: result.photoSkipped
      });
    }
    await getGoogleConnection().refresh();
    return { ok: true, outcomes } as const;
  }
);
