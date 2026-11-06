import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
  uniqueIndex
} from 'drizzle-orm/sqlite-core';
import type { ContactInput } from '../contact';

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
    resourceName: text()
  },
  (t) => [primaryKey({ columns: [t.contactId, t.accountId] })]
);
/** Feedback agents send through the MCP server's send_feedback tool. */
export const feedback = sqliteTable(
  'feedback',
  {
    id: text().primaryKey(),
    userId: text().notNull(),
    // The MCP client that sent it, so feedback can be grouped by app.
    clientId: text().notNull(),
    message: text().notNull(),
    createdAt: integer().notNull()
  },
  (t) => [index('feedback_created').on(t.createdAt)]
);

export const jwks = sqliteTable('jwks', {
  id: text().primaryKey(),
  publicKey: text().notNull(),
  privateKey: text().notNull(),
  createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
  expiresAt: integer({ mode: 'timestamp_ms' }),
  alg: text(),
  crv: text()
});

export const oauthClient = sqliteTable(
  'oauthClient',
  {
    id: text().primaryKey(),
    clientId: text().notNull().unique(),
    clientSecret: text(),
    clientDiscoveryId: text(),
    disabled: integer({ mode: 'boolean' }).default(false),
    skipConsent: integer({ mode: 'boolean' }),
    enableEndSession: integer({ mode: 'boolean' }),
    subjectType: text(),
    scopes: text({ mode: 'json' }),
    clientCredentialsScopes: text({
      mode: 'json'
    }).default([]),
    userId: text().references(() => user.id, { onDelete: 'cascade' }),
    createdAt: integer({ mode: 'timestamp_ms' }),
    updatedAt: integer({ mode: 'timestamp_ms' }),
    name: text(),
    uri: text(),
    icon: text(),
    contacts: text({ mode: 'json' }),
    tos: text(),
    policy: text(),
    softwareId: text(),
    softwareVersion: text(),
    softwareStatement: text(),
    redirectUris: text({ mode: 'json' }).notNull(),
    postLogoutRedirectUris: text({ mode: 'json' }),
    backchannelLogoutUri: text(),
    backchannelLogoutSessionRequired: integer({
      mode: 'boolean'
    }),
    tokenEndpointAuthMethod: text(),
    applicationType: text(),
    jwks: text(),
    jwksUri: text(),
    grantTypes: text({ mode: 'json' }),
    responseTypes: text({ mode: 'json' }),
    requirePKCE: integer({ mode: 'boolean' }),
    dpopBoundAccessTokens: integer({
      mode: 'boolean'
    }).default(false),
    referenceId: text(),
    metadata: text({ mode: 'json' })
  },
  (table) => [index('oauthClient_userId_idx').on(table.userId)]
);

export const oauthResource = sqliteTable('oauthResource', {
  id: text().primaryKey(),
  identifier: text().notNull().unique(),
  name: text().notNull(),
  accessTokenTtl: integer(),
  refreshTokenTtl: integer(),
  signingAlgorithm: text(),
  signingKeyId: text(),
  allowedScopes: text({ mode: 'json' }),
  customClaims: text({ mode: 'json' }),
  dpopBoundAccessTokensRequired: integer({
    mode: 'boolean'
  }).default(false),
  disabled: integer({ mode: 'boolean' }).default(false),
  createdAt: integer({ mode: 'timestamp_ms' }),
  updatedAt: integer({ mode: 'timestamp_ms' }),
  policyVersion: integer().default(1),
  metadata: text({ mode: 'json' })
});

export const oauthClientResource = sqliteTable(
  'oauthClientResource',
  {
    id: text().primaryKey(),
    clientId: text()
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: 'cascade' }),
    resourceId: text()
      .notNull()
      .references(() => oauthResource.identifier, { onDelete: 'cascade' }),
    metadata: text({ mode: 'json' }),
    createdAt: integer({ mode: 'timestamp_ms' })
  },
  (table) => [
    uniqueIndex('oauthClientResource_clientId_resourceId_uidx').on(
      table.clientId,
      table.resourceId
    ),
    index('oauthClientResource_clientId_idx').on(table.clientId),
    index('oauthClientResource_resourceId_idx').on(table.resourceId)
  ]
);

export const oauthRefreshToken = sqliteTable(
  'oauthRefreshToken',
  {
    id: text().primaryKey(),
    token: text().notNull().unique(),
    clientId: text()
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: 'cascade' }),
    sessionId: text().references(() => session.id, {
      onDelete: 'set null'
    }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    referenceId: text(),
    authorizationCodeId: text(),
    resources: text({ mode: 'json' }),
    requestedUserInfoClaims: text({
      mode: 'json'
    }),
    expiresAt: integer({ mode: 'timestamp_ms' }).notNull(),
    createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
    revoked: integer({ mode: 'timestamp_ms' }),
    rotatedAt: integer({ mode: 'timestamp_ms' }),
    rotationReplayResponse: text(),
    rotationReplayExpiresAt: integer({
      mode: 'timestamp_ms'
    }),
    authTime: integer({ mode: 'timestamp_ms' }),
    confirmation: text({ mode: 'json' }),
    scopes: text({ mode: 'json' }).notNull()
  },
  (table) => [
    index('oauthRefreshToken_clientId_idx').on(table.clientId),
    index('oauthRefreshToken_sessionId_idx').on(table.sessionId),
    index('oauthRefreshToken_userId_idx').on(table.userId),
    index('oauthRefreshToken_authorizationCodeId_idx').on(table.authorizationCodeId)
  ]
);

export const oauthAccessToken = sqliteTable(
  'oauthAccessToken',
  {
    id: text().primaryKey(),
    token: text().notNull().unique(),
    clientId: text()
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: 'cascade' }),
    sessionId: text().references(() => session.id, {
      onDelete: 'set null'
    }),
    userId: text().references(() => user.id, { onDelete: 'cascade' }),
    referenceId: text(),
    authorizationCodeId: text(),
    resources: text({ mode: 'json' }),
    requestedUserInfoClaims: text({
      mode: 'json'
    }),
    refreshId: text().references(() => oauthRefreshToken.id, {
      onDelete: 'cascade'
    }),
    expiresAt: integer({ mode: 'timestamp_ms' }).notNull(),
    createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
    revoked: integer({ mode: 'timestamp_ms' }),
    confirmation: text({ mode: 'json' }),
    scopes: text({ mode: 'json' }).notNull()
  },
  (table) => [
    index('oauthAccessToken_clientId_idx').on(table.clientId),
    index('oauthAccessToken_sessionId_idx').on(table.sessionId),
    index('oauthAccessToken_userId_idx').on(table.userId),
    index('oauthAccessToken_authorizationCodeId_idx').on(table.authorizationCodeId),
    index('oauthAccessToken_refreshId_idx').on(table.refreshId)
  ]
);

export const oauthConsent = sqliteTable(
  'oauthConsent',
  {
    id: text().primaryKey(),
    clientId: text()
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: 'cascade' }),
    userId: text().references(() => user.id, { onDelete: 'cascade' }),
    referenceId: text(),
    resources: text({ mode: 'json' }),
    requestedUserInfoClaims: text({
      mode: 'json'
    }),
    scopes: text({ mode: 'json' }).notNull(),
    createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer({ mode: 'timestamp_ms' }).notNull()
  },
  (table) => [
    index('oauthConsent_clientId_idx').on(table.clientId),
    index('oauthConsent_userId_idx').on(table.userId)
  ]
);

export const oauthClientAssertion = sqliteTable('oauthClientAssertion', {
  id: text().primaryKey(),
  expiresAt: integer({ mode: 'timestamp_ms' }).notNull()
});
