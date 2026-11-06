import { Contact, type ContactInput } from './contact';
import { FormConfig } from './form-config';
import { toVCard } from './vcard';
import type { AddressBookActions, Invitation, PeopleBook, Result } from './address-book-actions';

/**
 * The landing page's pretend address book. Everything stays in the visitor's browser: actions
 * change the book in place, so pass them a `$state` proxy to see the real components update.
 */

const DAY = 86_400_000;
/** Lower than the app's limit, since nothing here is ever cleaned up. */
const OPEN_LIMIT = 20;
/** A reserved page name, so demo links never point at someone's real page. */
const SLUG = 'demo';
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const person = (
  firstName: string,
  lastName: string,
  city: string,
  region: string,
  photo: number
): ContactInput => ({
  ...Contact.empty(),
  firstName,
  lastName,
  email: `${firstName.toLowerCase()}@example.com`,
  phone: `(202) 555-01${String(photo).padStart(2, '0')}`,
  city,
  region,
  country: 'United States',
  photo: `/demo/${photo}.jpg`
});

function token() {
  const bytes = crypto.getRandomValues(new Uint8Array(7));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

const isOpen = (invitation: Invitation, now: number) => invitation.expiresAt > now;

export const DemoBook = {
  owner: {
    name: 'Robin',
    message: 'I’m getting my address book together. Add your details so we can stay in touch.'
  },

  /** Fixed ids and tokens, so the server render and the browser agree. */
  seed: (now = Date.now()): PeopleBook => ({
    profile: { slug: SLUG, form: FormConfig.empty() },
    contacts: [
      ['Alex', 'Morgan', 'Brooklyn', 'NY', 1, 41],
      ['Jamie', 'Chen', 'San Francisco', 'CA', 2, 23],
      ['Jordan', 'Davis', 'Austin', 'TX', 3, 12],
      ['Nina', 'Patel', 'Seattle', 'WA', 6, 2],
      ['Sam', 'Rivera', 'Los Angeles', 'CA', 7, 64]
    ].map(([first, last, city, region, photo, daysAgo]) => ({
      id: `demo-contact-${photo}`,
      ownerId: SLUG,
      invitationId: null,
      linkedUserId: null,
      createdAt: now - Number(daysAgo) * DAY,
      data: person(String(first), String(last), String(city), String(region), Number(photo)),
      source: null
    })),
    invitations: [
      {
        id: 'demo-link-maya',
        label: 'Maya',
        token: 'Mq7cTn2',
        reference: 'Mq7',
        createdAt: now - DAY,
        expiresAt: now + 29 * DAY
      },
      {
        id: 'demo-link-theo',
        label: 'Theo',
        token: 'Th4xWp9',
        reference: 'Th4',
        createdAt: now - 33 * DAY,
        expiresAt: now - 3 * DAY
      }
    ]
  }),

  /** The link a friend would open next: the one asked for if it's still open, else the newest. */
  openLink: (book: PeopleBook, preferred: string | null, now = Date.now()) =>
    book.invitations.find((link) => link.id === preferred && isOpen(link, now)) ??
    book.invitations
      .filter((link) => isOpen(link, now))
      .toSorted((a, b) => b.createdAt - a.createdAt)[0] ??
    null,

  /**
   * `linkUrl` builds a link's address (the landing page passes the app's own), and `created`
   * hears about each new link, so the friend's side can follow it.
   */
  actions: (
    book: PeopleBook,
    {
      linkUrl,
      created
    }: { linkUrl: AddressBookActions['invitationUrl']; created: (id: string) => void }
  ): AddressBookActions => {
    const find = (id: string) => book.invitations.find((link) => link.id === id);
    const missing = {
      ok: false,
      message: 'That link was already used or deleted. Refresh to see your current links.'
    } as const;
    return {
      createInvitations: async ({ count, label }) => {
        const now = Date.now();
        if (book.invitations.filter((link) => isOpen(link, now)).length + count > OPEN_LIMIT)
          return {
            ok: false,
            message: `You can have ${OPEN_LIMIT} open links here. Delete some, then try again.`
          };
        const made = Array.from({ length: count }, (_, index) => {
          const value = token();
          return {
            id: `demo-link-${value}`,
            label: label.trim(),
            token: value,
            reference: value.slice(0, 3),
            createdAt: now + index,
            expiresAt: now + 30 * DAY
          };
        });
        book.invitations.push(...made);
        const first = made[0];
        if (first) created(first.id);
        return { ok: true, invitations: made };
      },
      deleteInvitation: async (id): Promise<Result> => {
        const index = book.invitations.findIndex((link) => link.id === id);
        if (index < 0) return missing;
        book.invitations.splice(index, 1);
        return { ok: true };
      },
      renewInvitation: async (id): Promise<Result> => {
        const link = find(id);
        if (!link) return missing;
        link.expiresAt = Date.now() + 30 * DAY;
        return { ok: true };
      },
      renameInvitation: async ({ id, label }): Promise<Result> => {
        const link = find(id);
        if (!link) return missing;
        link.label = label.trim();
        return { ok: true };
      },
      deleteContact: async (id) => {
        const index = book.contacts.findIndex((contact) => contact.id === id);
        if (index >= 0) book.contacts.splice(index, 1);
      },
      invitationUrl: linkUrl,
      vcardHref: (contact) => DemoBook.vcardHref([contact]),
      exportHref: null,
      formHref: '#fields'
    };
  },

  /** A download of these contacts that needs no server. */
  vcardHref: (contacts: Contact[]) =>
    `data:text/vcard;charset=utf-8,${encodeURIComponent(toVCard(contacts))}`,

  /** What happens when a friend sends the form: their card joins People and the link is used. */
  submit: (book: PeopleBook, id: string, data: ContactInput, now = Date.now()): Result => {
    const index = book.invitations.findIndex((link) => link.id === id);
    const link = book.invitations[index];
    if (!link || !isOpen(link, now))
      return { ok: false, message: 'This link expired. Ask Robin for a new one.' };
    book.invitations.splice(index, 1);
    book.contacts.push({
      id: `demo-contact-${link.id}`,
      ownerId: SLUG,
      invitationId: link.id,
      linkedUserId: null,
      createdAt: now,
      data,
      source: { label: link.label, reference: link.reference ?? link.id.slice(0, 8) }
    });
    return { ok: true };
  }
} as const;
