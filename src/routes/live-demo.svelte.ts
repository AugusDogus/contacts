import { Contact, type ContactInput } from '#lib/contact.ts';
import { DemoBook } from '#lib/demo-book.ts';
import { invitationUrl } from '#lib/links.ts';
import type { AddressBookActions } from '#lib/address-book-actions.ts';
import type { RequirableField } from '#lib/form-config.ts';
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

/** The question an owner adds of their own in the demo. */
const question = { id: 'met', label: 'How did we meet?', required: true };

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

  /** Whether a field, or the sample question of your own, is required. */
  requires(field: RequirableField | 'question') {
    const { form } = this.book.profile;
    return field === 'question'
      ? form.custom.some(({ id }) => id === question.id)
      : form.required.includes(field);
  }

  /** Marks a field required or optional; links already sent pick it up, as in the app. */
  require(field: RequirableField | 'question', on: boolean) {
    const { form } = this.book.profile;
    if (field !== 'question')
      form.required = on
        ? [...form.required, field]
        : form.required.filter((required) => required !== field);
    else form.custom = on ? [question] : [];
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
