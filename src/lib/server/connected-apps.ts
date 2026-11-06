import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { AppDatabase } from './db';
import { oauthAccessToken, oauthClient, oauthConsent, oauthRefreshToken } from './schema';

export type ConnectedApp = {
  /** The consent id, which is what a user disconnects. */
  id: string;
  name: string;
  /** Where the app says it lives. Registrant-chosen, so only https links are kept. */
  uri: string | null;
  scopes: string[];
  connectedAt: number;
  /** When the app last refreshed its access, about hourly while in use. */
  lastUsedAt: number | null;
};

// Better Auth's adapter JSON-encodes string arrays, then the json column encodes that string again.
const scopeList = z
  .string()
  .transform((value) => JSON.parse(value))
  .pipe(z.array(z.string()));
const httpsOnly = (value: string | null) => (value?.startsWith('https:') ? value : null);

/** MCP apps a user has authorized, through Better Auth's OAuth provider tables. */
export function connectedApps(db: AppDatabase) {
  async function list(userId: string): Promise<ConnectedApp[]> {
    const [apps, refreshes] = await Promise.all([
      db
        .select({
          id: oauthConsent.id,
          clientId: oauthConsent.clientId,
          name: oauthClient.name,
          uri: oauthClient.uri,
          scopes: oauthConsent.scopes,
          connectedAt: oauthConsent.createdAt
        })
        .from(oauthConsent)
        .innerJoin(oauthClient, eq(oauthClient.clientId, oauthConsent.clientId))
        .where(eq(oauthConsent.userId, userId))
        .orderBy(desc(oauthConsent.createdAt)),
      db
        .select({
          clientId: oauthRefreshToken.clientId,
          at: sql<number>`max(${oauthRefreshToken.createdAt})`
        })
        .from(oauthRefreshToken)
        .where(eq(oauthRefreshToken.userId, userId))
        .groupBy(oauthRefreshToken.clientId)
    ]);
    const lastUsed = new Map(refreshes.map(({ clientId, at }) => [clientId, at]));
    return apps.map((app) => ({
      id: app.id,
      name: app.name || 'An unnamed app',
      uri: httpsOnly(app.uri),
      scopes: scopeList.parse(app.scopes),
      connectedAt: app.connectedAt.getTime(),
      lastUsedAt: lastUsed.get(app.clientId) ?? null
    }));
  }

  /** Revokes the consent and every token the app holds for this user. */
  async function disconnect(userId: string, consentId: string) {
    const consent = await db
      .select({ clientId: oauthConsent.clientId })
      .from(oauthConsent)
      .where(and(eq(oauthConsent.id, consentId), eq(oauthConsent.userId, userId)))
      .get();
    if (!consent) return false;
    const owned = <T extends typeof oauthAccessToken | typeof oauthRefreshToken>(table: T) =>
      and(eq(table.userId, userId), eq(table.clientId, consent.clientId));
    await db.batch([
      db.delete(oauthAccessToken).where(owned(oauthAccessToken)),
      db.delete(oauthRefreshToken).where(owned(oauthRefreshToken)),
      db.delete(oauthConsent).where(eq(oauthConsent.id, consentId))
    ]);
    return true;
  }

  /** Access tokens are self-contained JWTs, so a disconnect only takes effect if /mcp checks this. */
  async function isConnected(userId: string, clientId: string) {
    const row = await db
      .select({ id: oauthConsent.id })
      .from(oauthConsent)
      .where(and(eq(oauthConsent.userId, userId), eq(oauthConsent.clientId, clientId)))
      .get();
    return row !== undefined;
  }

  return { list, disconnect, isConnected };
}
