import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { pushSQLiteSchema } from 'drizzle-kit/api';
import * as schema from '../src/lib/server/schema';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export async function testDatabase() {
  const directory = mkdtempSync(join(tmpdir(), 'gather-test-'));
  const client = createClient({ url: `file:${join(directory, 'test.sqlite')}` });
  const db = drizzle(client, { schema });
  await (await pushSQLiteSchema(schema, db)).apply();
  return {
    db,
    close: () => {
      client.close();
      rmSync(directory, { recursive: true, force: true });
    }
  };
}
