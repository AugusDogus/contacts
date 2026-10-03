import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { AppDatabase } from './db';
import { rateLimit } from './schema';

const windowMs = 10 * 60_000;
const requestLimit = 60;

// Shared across serverless instances and every invitation lookup/submission route.
export async function checkInvitationAccess(db: AppDatabase, address: string) {
  const now = Date.now();
  const key = `invitation:${createHash('sha256').update(address).digest('hex')}`;
  const expired = sql`${rateLimit.lastRequest} <= ${now - windowMs}`;
  const [entry] = await db
    .insert(rateLimit)
    .values({ id: key, key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`CASE WHEN ${expired} THEN 1 ELSE MIN(${rateLimit.count} + 1, ${requestLimit + 1}) END`,
        lastRequest: sql`CASE WHEN ${expired} THEN ${now} ELSE ${rateLimit.lastRequest} END`
      }
    })
    .returning({ count: rateLimit.count });
  if (!entry)
    throw new Error('Invitation request counter returned no row. Check the database connection.');
  if (entry.count > requestLimit)
    error(429, 'Too many invitation requests. Wait up to 10 minutes and try again.');
}
