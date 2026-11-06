import { randomUUID } from 'node:crypto';
import { McpServer, requireScopes } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { addressBook, OPEN_INVITATION_LIMIT } from './address-book';
import type { AppDatabase } from './db';
import { McpScope } from './mcp-scope';
import { feedback } from './schema';

type Book = ReturnType<typeof addressBook>;
type ListedContact = Awaited<ReturnType<Book['contacts']>>[number];

export type ContactsMcpOptions = {
  db: AppDatabase;
  /** The verified token subject. Every tool reads and writes only this owner's data. */
  ownerId: string;
  /** The OAuth client making the request, recorded with any feedback it sends. */
  clientId: string;
  /** Builds the shareable URL for an invitation token on the owner's page. */
  invitationLink: (token: string, slug: string) => string;
};

const text = (value: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }]
});
const failure = (message: string) => ({
  isError: true,
  content: [{ type: 'text' as const, text: message }]
});
const missingProfile = failure(
  'This account has no address book yet. Open Contacts Exchange in a browser once to set it up, then try again.'
);

// Photos are large data URLs that would flood a model's context.
const summary = ({ id, createdAt, data: { photo, ...details }, source }: ListedContact) => ({
  id,
  addedAt: new Date(createdAt).toISOString(),
  hasPhoto: Boolean(photo),
  ...details,
  source
});

const matches = (contact: ListedContact, search: string) =>
  [
    contact.data.firstName,
    contact.data.lastName,
    contact.data.email,
    contact.data.phone,
    contact.data.company
  ]
    .join(' ')
    .toLowerCase()
    .includes(search.toLowerCase());

/** An MCP server over one owner's address book. Build one per request. */
export function contactsMcpServer({ db, ownerId, clientId, invitationLink }: ContactsMcpOptions) {
  const book = addressBook(db);
  const server = new McpServer(
    { name: 'contacts-exchange', version: '1.0.0' },
    {
      instructions:
        'Contacts Exchange is an address book friends fill in through invitation links. Before your final reply, consider whether anything about this server got in your way, was missing, or worked especially well, and if so send it with send_feedback.'
    }
  );

  server.registerTool(
    'list_contacts',
    {
      title: 'List contacts',
      description:
        'List the contacts friends have added to your address book, newest first. Optionally filter by name, email, phone, or company.',
      inputSchema: z.object({
        search: z.string().trim().max(100).optional().describe('Case-insensitive text to match')
      }),
      annotations: { readOnlyHint: true },
      scopeChallenge: requireScopes(McpScope.readContacts)
    },
    async ({ search }) => {
      const contacts = await book.contacts(ownerId);
      return text((search ? contacts.filter((c) => matches(c, search)) : contacts).map(summary));
    }
  );

  server.registerTool(
    'list_invitations',
    {
      title: 'List open invitation links',
      description: 'List invitation links that have not been used or deleted yet.',
      annotations: { readOnlyHint: true },
      scopeChallenge: requireScopes(McpScope.readContacts)
    },
    async () => {
      const profile = await book.profile(ownerId);
      if (!profile) return missingProfile;
      const invitations = await book.openInvitations(ownerId);
      return text(
        invitations.map(({ id, label, token, reference, expiresAt }) => ({
          id,
          label,
          reference,
          // Links created before tokens were stored cannot be shown again.
          url: token ? invitationLink(token, profile.slug) : null,
          expiresAt: new Date(expiresAt).toISOString(),
          expired: expiresAt <= Date.now()
        }))
      );
    }
  );

  server.registerTool(
    'create_invitations',
    {
      title: 'Create invitation links',
      description:
        'Create single-use links that let friends add their contact details to your address book. Each link expires after 30 days.',
      inputSchema: z.object({
        count: z.number().int().min(1).max(20).default(1).describe('How many links to create'),
        label: z
          .string()
          .trim()
          .max(100)
          .default('')
          .describe('Who the links are for. Numbered when creating more than one.')
      }),
      scopeChallenge: requireScopes(McpScope.writeInvitations)
    },
    async ({ count, label }) => {
      const profile = await book.profile(ownerId);
      if (!profile) return missingProfile;
      if ((await book.openCount(ownerId)) + count > OPEN_INVITATION_LIMIT)
        return failure(
          `You can have ${OPEN_INVITATION_LIMIT} open links. Delete ones you no longer need in Contacts Exchange, then try again. No links were created.`
        );
      const created = await book.createInvitations(ownerId, count, label);
      return text(
        created.map(({ id, label, token, expiresAt }) => ({
          id,
          label,
          url: invitationLink(token, profile.slug),
          expiresAt: new Date(expiresAt).toISOString()
        }))
      );
    }
  );

  server.registerTool(
    'send_feedback',
    {
      title: 'Send feedback',
      description: [
        'Send feedback about Contacts Exchange to the people who build it. They read every message.',
        'Send it when a tool errors or confuses you, when you need something this server lacks to finish the task, when something worked especially well, or when the user has feedback about Contacts Exchange.',
        'Be specific: name the tools involved, quote error messages, and say what you expected, what happened, and what would have helped.',
        'Describe the user’s task in general terms. Never include contact details, invitation links, credentials, or other personal data.',
        'Afterwards, tell the user you sent feedback and summarize it in one sentence.'
      ].join(' '),
      inputSchema: z.object({
        message: z
          .string()
          .max(10_000)
          .regex(/\S/, 'Write at least one non-space character.')
          .describe('The feedback, in plain text')
      }),
      scopeChallenge: requireScopes(McpScope.readContacts)
    },
    async ({ message }) => {
      await db
        .insert(feedback)
        .values({ id: randomUUID(), userId: ownerId, clientId, message, createdAt: Date.now() });
      return text({ status: 'received' });
    }
  );

  return server;
}
