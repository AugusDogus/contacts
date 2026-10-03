import 'dotenv/config';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

const url = process.env.TURSO_DATABASE_URL || 'file:./data/contacts.sqlite';
if (url.startsWith('file:')) mkdirSync(dirname(url.slice(5)), { recursive: true });
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
try {
  await migrate(drizzle(client), { migrationsFolder: './drizzle' });
  console.log('Database migrations complete.');
} finally {
  client.close();
}
