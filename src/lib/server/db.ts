import * as env from '$app/env/private';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export const db = drizzle(
  createClient({
    url: env.TURSO_DATABASE_URL || 'file:./data/contacts.sqlite',
    authToken: env.TURSO_AUTH_TOKEN
  }),
  { schema }
);
export type AppDatabase = typeof db;
