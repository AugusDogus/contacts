import 'dotenv/config';
import { mkdirSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

const url = process.env.TURSO_DATABASE_URL || 'file:./data/contacts.sqlite';
if (url.startsWith('file:')) mkdirSync('./data', { recursive: true });

export default defineConfig({
  schema: './src/lib/server/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url,
    authToken: process.env.TURSO_AUTH_TOKEN
  }
});
