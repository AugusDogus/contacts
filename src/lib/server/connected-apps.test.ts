import { afterEach, describe, expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import { testDatabase } from '../../../test/database';
import { connectedApps } from './connected-apps';
import { oauthAccessToken, oauthClient, oauthConsent, oauthRefreshToken, user } from './schema';

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0)) close();
});

// Better Auth's adapter JSON-encodes arrays before the json column encodes them again.
const stored = (values: string[]) => JSON.stringify(values);

async function setup() {
  const { db, close } = await testDatabase();
  cleanup.push(close);
  const now = new Date(1_800_000_000_000);
  for (const id of ['owner', 'other'])
    await db.insert(user).values({
      id,
      name: id,
      email: `${id}@example.com`,
      createdAt: now,
      updatedAt: now
    });
  const connect = async (userId: string, clientId: string, name: string, uri: string) => {
    await db
      .insert(oauthClient)
      .values({
        id: clientId,
        clientId,
        name,
        uri,
        redirectUris: stored(['https://app.example/cb'])
      })
      .onConflictDoNothing();
    await db.insert(oauthConsent).values({
      id: `${userId}-${clientId}`,
      clientId,
      userId,
      scopes: stored(['contacts:read', 'offline_access']),
      createdAt: now,
      updatedAt: now
    });
    for (const [index, at] of [now.getTime(), now.getTime() + 3_600_000].entries()) {
      const id = `${userId}-${clientId}-refresh-${index}`;
      await db.insert(oauthRefreshToken).values({
        id,
        token: id,
        clientId,
        userId,
        scopes: ['contacts:read', 'offline_access'],
        createdAt: new Date(at),
        expiresAt: new Date(at + 30 * 86_400_000)
      });
      await db.insert(oauthAccessToken).values({
        id: `${id}-access`,
        token: `${id}-access`,
        clientId,
        userId,
        refreshId: id,
        scopes: ['contacts:read'],
        createdAt: new Date(at),
        expiresAt: new Date(at + 3_600_000)
      });
    }
  };
  return { db, apps: connectedApps(db), connect, now };
}

describe('connected apps', () => {
  test('lists a user’s apps with when each was last used, hiding non-https links', async () => {
    const { apps, connect, now } = await setup();
    await connect('owner', 'cursor', 'Cursor', 'https://cursor.example');
    await connect('owner', 'sketchy', 'Sketchy', 'javascript:alert(1)');
    await connect('other', 'cursor', 'Cursor', 'https://cursor.example');
    const listed = await apps.list('owner');
    expect(listed.map(({ name }) => name).sort()).toEqual(['Cursor', 'Sketchy']);
    expect(listed.find(({ name }) => name === 'Cursor')).toMatchObject({
      id: 'owner-cursor',
      uri: 'https://cursor.example',
      scopes: ['contacts:read', 'offline_access'],
      connectedAt: now.getTime(),
      lastUsedAt: now.getTime() + 3_600_000
    });
    expect(listed.find(({ name }) => name === 'Sketchy')?.uri).toBeNull();
  });

  test('disconnecting revokes the consent and every token for that user and app only', async () => {
    const { db, apps, connect } = await setup();
    await connect('owner', 'cursor', 'Cursor', 'https://cursor.example');
    await connect('other', 'cursor', 'Cursor', 'https://cursor.example');
    expect(await apps.disconnect('owner', 'owner-cursor')).toBe(true);
    expect(await apps.isConnected('owner', 'cursor')).toBe(false);
    expect(await apps.list('owner')).toEqual([]);
    const tokensFor = async (userId: string) => [
      ...(await db.select().from(oauthRefreshToken).where(eq(oauthRefreshToken.userId, userId))),
      ...(await db.select().from(oauthAccessToken).where(eq(oauthAccessToken.userId, userId)))
    ];
    expect(await tokensFor('owner')).toEqual([]);
    expect(await tokensFor('other')).toHaveLength(4);
    expect(await apps.isConnected('other', 'cursor')).toBe(true);
  });

  test('cannot disconnect another user’s app', async () => {
    const { apps, connect } = await setup();
    await connect('other', 'cursor', 'Cursor', 'https://cursor.example');
    expect(await apps.disconnect('owner', 'other-cursor')).toBe(false);
    expect(await apps.isConnected('other', 'cursor')).toBe(true);
  });
});
