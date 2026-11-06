import { randomUUID } from 'node:crypto';
import { McpServer, requireScopes } from '@modelcontextprotocol/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Contact, contactInput, type ContactInput } from '../contact';
import { addressBook, OPEN_INVITATION_LIMIT } from './address-book';
import type { AppDatabase } from './db';
import { McpServerInfo } from './discovery';
import { McpScope } from './mcp-scope';
import { photoFromUrl, type PhotoFetch } from './photo';
import { feedback, savedCards } from './schema';

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
  /** Downloads photos from links given to update_my_card. Must refuse non-public addresses. */
  fetchPhoto: PhotoFetch;
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

// The owner's own card without its photo, which is a large data URL.
const cardSummary = ({ photo, ...details }: ContactInput) => ({
  ...details,
  hasPhoto: Boolean(photo)
});

// Every editable text field of a card. contactInput validates the merged result.
const cardFields = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional().describe('An email or phone is required'),
  phone: z.string().optional(),
  street: z.string().optional(),
  street2: z.string().optional().describe('Apartment, suite, or unit'),
  city: z.string().optional(),
  region: z.string().optional().describe('State, province, or region'),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  birthday: z.string().optional().describe('YYYY-MM-DD'),
  pronouns: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional().describe('An https:// or http:// link'),
  notes: z.string().optional(),
  photoUrl: z
    .union([z.string(), z.null()])
    .optional()
    .describe(
      'A public https:// link to a JPEG, PNG, or WebP image to use as the photo, or null to remove it'
    )
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
export function contactsMcpServer({
  db,
  ownerId,
  clientId,
  invitationLink,
  fetchPhoto
}: ContactsMcpOptions) {
  const book = addressBook(db);
  const savedCard = async () => {
    const row = await db.query.savedCards.findFirst({ where: eq(savedCards.userId, ownerId) });
    return row ? contactInput.parse(row.data) : null;
  };
  const server = new McpServer(
    { name: McpServerInfo.name, version: McpServerInfo.version, title: McpServerInfo.title },
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

  server.registerTool(
    'get_my_card',
    {
      title: 'Get my card',
      description:
        'Read your own contact card. It pre-fills invitations other people send you. Returns null if you have not made one.',
      annotations: { readOnlyHint: true },
      scopeChallenge: requireScopes(McpScope.readContacts)
    },
    async () => {
      const card = await savedCard();
      return text(card ? cardSummary(card) : null);
    }
  );

  server.registerTool(
    'update_my_card',
    {
      title: 'Update my card',
      description:
        'Change fields on your own contact card. Only the fields you pass change. Creating a card needs a first name, last name, and an email or phone.',
      inputSchema: cardFields,
      scopeChallenge: requireScopes(McpScope.writeCard)
    },
    async ({ photoUrl, ...fields }) => {
      const current = (await savedCard()) ?? Contact.empty();
      let photo = current.photo;
      if (photoUrl === null) photo = '';
      else if (photoUrl !== undefined) {
        const downloaded = await photoFromUrl(photoUrl, fetchPhoto);
        if (!downloaded.ok) return failure(`${downloaded.message} Your card was not changed.`);
        photo = downloaded.photo;
      }
      const parsed = contactInput.safeParse({ ...current, ...fields, photo });
      if (!parsed.success)
        return failure(
          `${parsed.error.issues[0]?.message ?? 'Check the card details.'} Your card was not changed.`
        );
      await db
        .insert(savedCards)
        .values({ userId: ownerId, data: parsed.data })
        .onConflictDoUpdate({ target: savedCards.userId, set: { data: parsed.data } });
      return text(cardSummary(parsed.data));
    }
  );

  return server;
}
