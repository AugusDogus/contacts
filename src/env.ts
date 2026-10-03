import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

export const variables = defineEnvVars({
  BETTER_AUTH_URL: { schema: z.string().default('http://localhost:5173') },
  BETTER_AUTH_SECRET: { schema: z.string().optional() },
  TURSO_DATABASE_URL: { schema: z.string().default('file:./data/contacts.sqlite') },
  TURSO_AUTH_TOKEN: { schema: z.string().optional() },
  GOOGLE_CLIENT_ID: { schema: z.string().optional() },
  GOOGLE_CLIENT_SECRET: { schema: z.string().optional() },
  PUBLIC_CONTACTS_DOMAIN: { public: true, schema: z.string().default('contacts.exchange') }
});
