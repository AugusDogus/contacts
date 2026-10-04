import { command, getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { requireViewer } from './server/viewer';
import { auth, googleConfigured } from './server/auth';
import { db } from './server/db';
import { contacts, googleImports } from './server/schema';
import { addressBook } from './server/address-book';
import { importGoogleContact, listGooglePeople } from './server/google-contacts';

const contactsScope = 'https://www.googleapis.com/auth/contacts';
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
    .select({
      contactId: googleImports.contactId,
      status: googleImports.status,
      resourceName: googleImports.resourceName,
      conflicts: googleImports.conflicts
    })
    .from(googleImports)
    .innerJoin(contacts, eq(contacts.id, googleImports.contactId))
    .where(and(eq(contacts.ownerId, viewer.id), eq(googleImports.accountId, account.accountId)));
  return { status: 'connected', imports } as const;
});

export const importToGoogle = command(z.array(z.string()).min(1).max(3), async (ids) => {
  const viewer = requireViewer();
  if (viewer.kind === 'demo' || !googleConfigured)
    return {
      ok: false,
      message: 'Sign in to an account with Google Contacts connected before importing.',
      imported: 0,
      merged: 0,
      photoSkipped: 0
    } as const;
  const headers = getRequestEvent().request.headers;
  const accounts = await auth.api.listUserAccounts({ headers });
  const account = accounts.find(
    (account) => account.providerId === 'google' && account.scopes.includes(contactsScope)
  );
  if (!account)
    return {
      ok: false,
      message: 'Connect Google Contacts before importing.',
      imported: 0,
      merged: 0,
      photoSkipped: 0
    } as const;
  let token: string;
  try {
    const result = await auth.api.getAccessToken({ headers, body: { accountId: account.id } });
    if (!result.accessToken)
      return {
        ok: false,
        message: 'Google did not return an access token. Reconnect your account.',
        imported: 0,
        merged: 0,
        photoSkipped: 0
      } as const;
    token = result.accessToken;
  } catch {
    return {
      ok: false,
      message:
        'Google access expired and could not be renewed. Reconnect your account. Your contacts are still saved here.',
      imported: 0,
      merged: 0,
      photoSkipped: 0
    } as const;
  }
  const listed = await listGooglePeople(token);
  if (!listed.ok)
    return { ok: false, message: listed.message, imported: 0, merged: 0, photoSkipped: 0 } as const;
  const google = listed.people;
  const cards = (await addressBook(db).contacts(viewer.id)).filter((contact) =>
    ids.includes(contact.id)
  );
  let imported = 0;
  let merged = 0;
  let photoSkipped = 0;
  // Google requires sequential writes for the same account. Keep each serverless batch small.
  for (const contact of cards) {
    const result = await importGoogleContact(db, contact, account.accountId, token, google);
    if (result.status === 'failed') {
      await getGoogleConnection().refresh();
      return { ok: false, message: result.message, imported, merged, photoSkipped } as const;
    }
    if (result.status === 'skipped') continue;
    // Keep the list current so later cards in this batch match what was just written.
    const index = google.findIndex((person) => person.resourceName === result.person.resourceName);
    if (index === -1) google.push(result.person);
    else google[index] = result.person;
    if (result.status === 'imported') imported++;
    else merged++;
    if (result.photoSkipped) photoSkipped++;
  }
  await getGoogleConnection().refresh();
  return { ok: true, imported, merged, photoSkipped } as const;
});

export const dismissConflicts = command(z.string(), async (contactId) => {
  const viewer = requireViewer();
  const owned = await db.query.contacts.findFirst({
    where: and(eq(contacts.id, contactId), eq(contacts.ownerId, viewer.id))
  });
  if (owned)
    await db
      .update(googleImports)
      .set({ conflicts: [] })
      .where(eq(googleImports.contactId, contactId));
  await getGoogleConnection().refresh();
});
