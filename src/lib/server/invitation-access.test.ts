import { expect, test } from 'bun:test';
import { isHttpError } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { testDatabase } from '../../../test/database';
import { checkInvitationAccess } from './invitation-access';
import { rateLimit } from './schema';

test('limits concurrent invitation requests, isolates addresses, and resets expired windows', async () => {
  const { db, close } = await testDatabase();
  try {
    const attempts = await Promise.allSettled(
      Array.from({ length: 61 }, () => checkInvitationAccess(db, '192.0.2.1'))
    );
    expect(attempts.filter((attempt) => attempt.status === 'fulfilled')).toHaveLength(60);
    const rejected = attempts.find((attempt) => attempt.status === 'rejected');
    expect(rejected?.status === 'rejected' && isHttpError(rejected.reason, 429)).toBe(true);
    await checkInvitationAccess(db, '192.0.2.2');
    const rows = await db.select().from(rateLimit);
    expect(JSON.stringify(rows)).not.toContain('192.0.2.');
    const exhausted = rows.find((row) => row.count === 61);
    if (!exhausted) throw new Error('Expected an exhausted request window.');
    await db.update(rateLimit).set({ lastRequest: 0 }).where(eq(rateLimit.id, exhausted.id));
    await checkInvitationAccess(db, '192.0.2.1');
    const reset = await db.query.rateLimit.findFirst({ where: eq(rateLimit.id, exhausted.id) });
    expect(reset?.count).toBe(1);
  } finally {
    close();
  }
});
