import type { Contact } from './contact';
import type { FormConfig } from './form-config';

export type Result = { ok: true } | { ok: false; message: string };

/** An open invitation link, as its owner sees it. */
export type Invitation = {
  id: string;
  label: string;
  /** Null for links created before tokens were kept. */
  token: string | null;
  reference: string | null;
  createdAt: number;
  expiresAt: number;
};

/** What the People view shows. */
export type PeopleBook = {
  profile: { slug: string; form: FormConfig };
  contacts: Contact[];
  invitations: Invitation[];
};

/**
 * What the People view can do: the signed-in app passes its remote functions, and the
 * landing page passes an in-memory demo, so both show the same components.
 */
export type AddressBookActions = {
  createInvitations: (input: {
    count: number;
    label: string;
  }) => Promise<
    { ok: true; invitations: (Invitation & { token: string })[] } | { ok: false; message: string }
  >;
  deleteInvitation: (id: string) => Promise<Result>;
  renewInvitation: (id: string) => Promise<Result>;
  renameInvitation: (input: { id: string; label: string }) => Promise<Result>;
  deleteContact: (id: string) => Promise<void>;
  invitationUrl: (token: string, slug: string) => string;
  vcardHref: (contact: Contact) => string;
  /** The export page, or null to hide the Export button. */
  exportHref: string | null;
  /** Where to change what friends are asked for. */
  formHref: string;
};
