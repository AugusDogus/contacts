import { Contact, type ContactInput } from '#lib/contact.ts';
import { DemoBook } from '#lib/demo-book.ts';
import { invitationUrl } from '#lib/links.ts';
import type { AddressBookActions } from '#lib/address-book-actions.ts';
import mayaPhoto from '../../static/demo/5.jpg?inline';

/** The friend's side: their form for the open link, or what they see once it's sent. */
type Friend = { kind: 'form'; draft: ContactInput; key: number } | { kind: 'sent' };

/** Maya's card, filled in as the first link opens, like the capture it replaced. */
const maya: ContactInput = {
  ...Contact.empty(),
  firstName: 'Maya',
  lastName: 'Brooks',
  email: 'maya@example.com',
  phone: '(202) 555-0147',
  photo: mayaPhoto
};

/** One demo address book shared by every step of How it works. */
export class LiveDemo {
  book = $state(DemoBook.seed());
  friend = $state<Friend>({ kind: 'form', draft: maya, key: 0 });
  #preferred = $state<string | null>(null);
  /** The link the friend's step shows. */
  link = $derived(DemoBook.openLink(this.book, this.#preferred));
  readonly actions: AddressBookActions;

  constructor(origin: string) {
    this.actions = DemoBook.actions(this.book, {
      linkUrl: (token, slug) => invitationUrl(token, origin, slug),
      created: (id) => {
        this.#preferred = id;
        this.open();
      }
    });
  }

  /** Shows a blank form for the current link. */
  open() {
    const key = this.friend.kind === 'form' ? this.friend.key + 1 : 0;
    this.friend = { kind: 'form', draft: Contact.empty(), key };
  }

  send(contact: ContactInput) {
    const link = this.link;
    if (!link)
      return { ok: false, message: 'This link expired. Ask Robin for a new one.' } as const;
    const result = DemoBook.submit(this.book, link.id, contact);
    if (result.ok) this.friend = { kind: 'sent' };
    return result;
  }
}
