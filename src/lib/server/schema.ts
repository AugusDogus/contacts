import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';
import type { ContactInput } from '../contact';
import type { Conflict } from '../google-person';

export const user = sqliteTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: integer({ mode: 'boolean' }).notNull().default(false),
  image: text(),
  createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' }).notNull()
});
export const session = sqliteTable(
  'session',
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text().notNull().unique(),
    expiresAt: integer({ mode: 'timestamp_ms' }).notNull(),
    createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer({ mode: 'timestamp_ms' }).notNull(),
    ipAddress: text(),
    userAgent: text()
  },
  (t) => [index('session_user').on(t.userId)]
);
export const account = sqliteTable(
  'account',
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accountId: text().notNull(),
    providerId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: integer({ mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer({ mode: 'timestamp_ms' }),
    scope: text(),
    password: text(),
    createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer({ mode: 'timestamp_ms' }).notNull()
  },
  (t) => [index('account_user').on(t.userId)]
);
export const verification = sqliteTable(
  'verification',
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: integer({ mode: 'timestamp_ms' }).notNull(),
    createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer({ mode: 'timestamp_ms' }).notNull()
  },
  (t) => [index('verification_identifier').on(t.identifier)]
);
export const rateLimit = sqliteTable('rateLimit', {
  id: text().primaryKey(),
  key: text().notNull().unique(),
  count: integer().notNull(),
  lastRequest: integer().notNull()
});
export const profiles = sqliteTable('profiles', {
  ownerId: text().primaryKey(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  message: text()
    .notNull()
    .default('I’m getting my address book together. Add your details so we can stay in touch.'),
  // Required and custom fields. Null until the owner changes them; read with FormConfig.parse.
  form: text({ mode: 'json' }),
  createdAt: integer().notNull()
});
export const invitations = sqliteTable(
  'invitations',
  {
    id: text().primaryKey(),
    ownerId: text()
      .notNull()
      .references(() => profiles.ownerId, { onDelete: 'cascade' }),
    tokenHash: text().notNull().unique(),
    // Kept so owners can copy a link again. Null for links created before this column.
    token: text(),
    reference: text(),
    label: text().notNull(),
    status: text({ enum: ['pending', 'used', 'revoked'] }).notNull(),
    createdAt: integer().notNull(),
    expiresAt: integer().notNull()
  },
  (t) => [index('invitations_owner').on(t.ownerId)]
);
export const contacts = sqliteTable(
  'contacts',
  {
    id: text().primaryKey(),
    ownerId: text()
      .notNull()
      .references(() => profiles.ownerId, { onDelete: 'cascade' }),
    invitationId: text()
      .unique()
      .references(() => invitations.id),
    linkedUserId: text(),
    claimHash: text().unique(),
    createdAt: integer().notNull(),
    data: text({ mode: 'json' }).$type<ContactInput>().notNull()
  },
  (t) => [index('contacts_owner').on(t.ownerId)]
);
export const savedCards = sqliteTable('saved_cards', {
  userId: text().primaryKey(),
  data: text({ mode: 'json' }).$type<ContactInput>().notNull()
});
export const googleImports = sqliteTable(
  'google_imports',
  {
    contactId: text()
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    accountId: text().notNull(),
    status: text({ enum: ['pending', 'done', 'merged', 'uncertain'] }).notNull(),
    resourceName: text(),
    // Details a matched Google contact already had with different values. Null for new contacts.
    conflicts: text({ mode: 'json' }).$type<Conflict[]>()
  },
  (t) => [primaryKey({ columns: [t.contactId, t.accountId] })]
);
