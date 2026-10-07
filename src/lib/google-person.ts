import { z } from 'zod';
import type { ContactInput } from './contact';
import { Address } from './address';

/** A contact as Google's People API describes it, so requests are checked against Google's types. */
export type Person = gapi.client.people.Person;

/**
 * The card's labelled answers for Google's custom fields: pronouns (Google Contacts has no
 * field it shows for them) followed by the owner's custom questions.
 */
function customFields(contact: ContactInput) {
  const answers = contact.custom.map(({ label, value }) => ({ label, value }));
  const pronouns = 'Pronouns';
  return contact.pronouns && !answers.some(({ label }) => normal(label) === normal(pronouns))
    ? [{ label: pronouns, value: contact.pronouns }, ...answers]
    : answers;
}

export function toGooglePerson(contact: ContactInput): Person {
  const notes = contact.notes;
  const custom = customFields(contact);
  return {
    names: [{ givenName: contact.firstName, familyName: contact.lastName }],
    ...(contact.email ? { emailAddresses: [{ value: contact.email, type: 'home' }] } : {}),
    ...(contact.phone ? { phoneNumbers: [{ value: contact.phone, type: 'mobile' }] } : {}),
    ...(contact.street ||
    contact.street2 ||
    contact.city ||
    contact.region ||
    contact.postalCode ||
    contact.country
      ? {
          addresses: [
            {
              type: 'home',
              streetAddress: contact.street,
              extendedAddress: contact.street2,
              city: contact.city,
              region: contact.region,
              postalCode: contact.postalCode,
              country: contact.country
            }
          ]
        }
      : {}),
    ...(contact.birthday
      ? {
          birthdays: [
            {
              date: {
                year: Number(contact.birthday.slice(0, 4)),
                month: Number(contact.birthday.slice(5, 7)),
                day: Number(contact.birthday.slice(8, 10))
              }
            }
          ]
        }
      : {}),
    ...(contact.company ? { organizations: [{ name: contact.company }] } : {}),
    ...(contact.website ? { urls: [{ value: contact.website }] } : {}),
    ...(notes ? { biographies: [{ value: notes, contentType: 'TEXT_PLAIN' }] } : {}),
    ...(custom.length
      ? { userDefined: custom.map(({ label, value }) => ({ key: label, value })) }
      : {})
  };
}

const text = z.string().optional();
/**
 * A list of Google's entries, checked for the parts read here and otherwise kept exactly as
 * Google sent them, so labels such as "work" survive when a list is sent back.
 */
const entry = <T>(shape: z.ZodRawShape) => {
  const check = z.looseObject(shape);
  return z.array(z.custom<T>((value) => check.safeParse(value).success)).optional();
};
const schema = z.object({
  resourceName: z.string().regex(/^people\/[A-Za-z0-9_-]+$/),
  etag: text,
  names: entry<gapi.client.people.Name>({ givenName: text, familyName: text }),
  emailAddresses: entry<gapi.client.people.EmailAddress>({ value: text }),
  phoneNumbers: entry<gapi.client.people.PhoneNumber>({ value: text, canonicalForm: text }),
  addresses: entry<gapi.client.people.Address>({
    streetAddress: text,
    extendedAddress: text,
    city: text,
    region: text,
    postalCode: text,
    country: text,
    formattedValue: text
  }),
  birthdays: entry<gapi.client.people.Birthday>({
    date: z
      .object({
        year: z.number().optional(),
        month: z.number().optional(),
        day: z.number().optional()
      })
      .optional()
  }),
  organizations: entry<gapi.client.people.Organization>({ name: text }),
  urls: entry<gapi.client.people.Url>({ value: text }),
  biographies: entry<gapi.client.people.Biography>({ value: text }),
  nicknames: entry<gapi.client.people.Nickname>({ value: text }),
  userDefined: entry<gapi.client.people.UserDefined>({ key: text, value: text }),
  photos: entry<gapi.client.people.Photo>({ url: text, default: z.boolean().optional() })
});

/** The parts of a Google contact used to match and merge cards. */
export type GooglePerson = z.infer<typeof schema>;
/**
 * How to settle a detail: keep Google's, use the card's, keep both, or, for names, use the
 * card's and keep Google's as a nickname. For a detail Google lacks, `google` skips it.
 */
export type Resolution = 'google' | 'card' | 'both' | 'nickname';
type Shown = { key: string; label: string; google: string[]; card: string };
/**
 * One detail of a matched contact. `same` and `kept` (only Google has it) need nothing;
 * `added` (only the card has it) and `different` are decided by the owner.
 */
export type Row =
  | (Shown & { kind: 'same' | 'kept' })
  | (Shown & { kind: 'added' | 'different'; options: Resolution[]; selected: Resolution });
/** A row the owner decides. */
export type Decided = Extract<Row, { kind: 'added' | 'different' }>;
export type Decisions = Partial<Record<string, Resolution>>;
/** A Person field name, as used in Google's field lists such as `updatePersonFields`. */
export type PersonField = keyof Person;
type ListKey =
  | 'names'
  | 'emailAddresses'
  | 'phoneNumbers'
  | 'addresses'
  | 'birthdays'
  | 'organizations'
  | 'urls'
  | 'biographies';

const normal = (value = '') => value.trim().toLowerCase().replace(/\s+/g, ' ');
const digits = (value = '') => value.replace(/\D/g, '');
function samePhone(a = '', b = '') {
  const [x, y] = [digits(a), digits(b)];
  if (!x || !y) return false;
  // Compare national numbers so "+1 312…" matches "(312)…".
  return x.length >= 10 && y.length >= 10 ? x.slice(-10) === y.slice(-10) : x === y;
}
const join = (values: (string | undefined)[], separator = ', ') =>
  values.filter(Boolean).join(separator);
const present = (values: (string | undefined)[] = []) =>
  values.filter((value): value is string => Boolean(value));
/** "1994-03-12" as "March 12, 1994", and a year-less "03-12" as "March 12". */
function birthdayText(value: string) {
  const [year, month, day] = value.length === 5 ? ['2000', ...value.split('-')] : value.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(value.length === 5 ? {} : { year: 'numeric' })
  });
}
const birthday = (date?: { year?: number; month?: number; day?: number }) =>
  date?.month && date.day
    ? [date.year, date.month, date.day]
        .filter((part) => part !== undefined)
        .map((part) => String(part).padStart(2, '0'))
        .join('-')
    : '';
/** A copy of Google's entry without the read-only fields it rejects when written back. */
function writable<T extends object>(entry: T): T {
  const copy = { ...entry };
  for (const key of ['metadata', 'formattedType', 'canonicalForm'])
    Reflect.deleteProperty(copy, key);
  return copy;
}

function match(contact: ContactInput, people: GooglePerson[]) {
  const email = normal(contact.email);
  const byEmail =
    email && people.find((p) => p.emailAddresses?.some((e) => normal(e.value) === email));
  if (byEmail) return byEmail;
  const byPhone =
    contact.phone &&
    people.find((p) =>
      p.phoneNumbers?.some(
        (n) => samePhone(n.value, contact.phone) || samePhone(n.canonicalForm, contact.phone)
      )
    );
  if (byPhone) return byPhone;
  // Names alone are only trusted when they are unambiguous.
  const named = people.filter((p) =>
    p.names?.some(
      (n) =>
        normal(n.givenName) === normal(contact.firstName) &&
        normal(n.familyName) === normal(contact.lastName)
    )
  );
  return named.length === 1 ? (named[0] ?? null) : null;
}

/**
 * Describes every detail of the card and the matching Google contact, and plans the update.
 * Details only the card has are added and differing ones are settled by `decisions` or,
 * without one, by the default for that detail. Nothing is ever removed from Google.
 */
function merge(contact: ContactInput, person: GooglePerson, decisions: Decisions = {}) {
  const card = toGooglePerson(contact);
  const update: Person = { etag: person.etag };
  const fields: PersonField[] = [];
  const rows: Row[] = [];
  function decide(
    shown: Shown,
    kind: 'added' | 'different',
    options: Resolution[],
    fallback: Resolution
  ) {
    const decided = decisions[shown.key];
    const selected = decided && options.includes(decided) ? decided : fallback;
    rows.push({ ...shown, kind, options, selected });
    return selected;
  }
  function check<K extends ListKey>(
    key: K,
    existing: NonNullable<Person[K]> | undefined,
    same: () => boolean,
    choice: {
      label: string;
      google: string[];
      card: string;
      multiple: boolean;
      fallback: Resolution;
    }
  ) {
    const { label, google, card: shown, multiple, fallback } = choice;
    const base = { key, label, google, card: shown };
    const value = card[key];
    if (!value) {
      if (existing?.length) rows.push({ ...base, kind: 'kept' });
      return;
    }
    if (!existing?.length) {
      if (decide(base, 'added', ['card', 'google'], 'card') === 'google') return;
      update[key] = value;
      fields.push(key);
      return;
    }
    if (same()) {
      rows.push({ ...base, kind: 'same' });
      return;
    }
    const options: Resolution[] =
      key === 'names'
        ? ['card', 'nickname', 'google']
        : multiple
          ? ['both', 'card', 'google']
          : ['card', 'google'];
    const selected = decide(base, 'different', options, fallback);
    if (selected === 'google') return;
    if (selected === 'nickname') {
      // The name Google had, like "Mom", stays findable as a nickname.
      update.nicknames = [
        ...(person.nicknames ?? []).map(writable),
        ...google.map((value) => ({ value }))
      ];
      fields.push('nicknames');
    }
    if (key === 'biographies' && selected === 'both') {
      // Notes are one block of text, so keeping both appends the card's notes.
      const notes = join(
        [...(person.biographies ?? []).map((b) => b.value), card.biographies?.[0]?.value],
        '\n\n'
      );
      update.biographies = [{ value: notes, contentType: 'TEXT_PLAIN' }];
    } else
      update[key] = (
        selected === 'both' ? [...existing.map(writable), ...value] : value
      ) as Person[K];
    fields.push(key);
  }
  const names = person.names?.filter((n) => n.givenName || n.familyName);
  check(
    'names',
    names,
    () =>
      names?.some(
        (n) =>
          normal(n.givenName) === normal(contact.firstName) &&
          normal(n.familyName) === normal(contact.lastName)
      ) ?? false,
    {
      label: 'Name',
      google: names?.map((n) => join([n.givenName, n.familyName], ' ')) ?? [],
      card: `${contact.firstName} ${contact.lastName}`,
      multiple: false,
      // How you saved someone, like "Mom", usually matters more than their legal name.
      fallback: 'google'
    }
  );
  check(
    'emailAddresses',
    person.emailAddresses,
    () => person.emailAddresses?.some((e) => normal(e.value) === normal(contact.email)) ?? false,
    {
      label: 'Email',
      google: present(person.emailAddresses?.map((e) => e.value)),
      card: contact.email,
      multiple: true,
      fallback: 'both'
    }
  );
  check(
    'phoneNumbers',
    person.phoneNumbers,
    () => person.phoneNumbers?.some((n) => samePhone(n.value, contact.phone)) ?? false,
    {
      label: 'Phone',
      google: present(person.phoneNumbers?.map((n) => n.value)),
      card: contact.phone,
      multiple: true,
      fallback: 'both'
    }
  );
  const address = {
    streetAddress: contact.street,
    extendedAddress: contact.street2,
    city: contact.city,
    region: contact.region,
    postalCode: contact.postalCode,
    country: contact.country
  };
  const components = Object.keys(address) as (keyof typeof address)[];
  check(
    'addresses',
    person.addresses,
    () =>
      person.addresses?.some((existing) =>
        components.every((key) => !address[key] || normal(existing[key]) === normal(address[key]))
      ) ?? false,
    {
      label: 'Address',
      google: present(
        person.addresses?.map(
          (a) => a.formattedValue?.replace(/\n/g, ', ') || join(components.map((k) => a[k]))
        )
      ),
      card: join([
        contact.street,
        contact.street2,
        contact.city,
        join([contact.region, contact.postalCode], ' '),
        Address.name(contact.country) || contact.country
      ]),
      multiple: true,
      // People who send a new address have usually moved.
      fallback: 'card'
    }
  );
  const birthdays = person.birthdays?.filter((b) => birthday(b.date));
  check(
    'birthdays',
    birthdays,
    () =>
      birthdays?.some(
        (b) =>
          birthday(b.date) === contact.birthday || birthday(b.date) === contact.birthday.slice(5)
      ) ?? false,
    {
      label: 'Birthday',
      google: birthdays?.map((b) => birthdayText(birthday(b.date))) ?? [],
      card: birthdayText(contact.birthday),
      multiple: false,
      fallback: 'card'
    }
  );
  const organizations = person.organizations?.filter((o) => o.name);
  check(
    'organizations',
    organizations,
    () => organizations?.some((o) => normal(o.name) === normal(contact.company)) ?? false,
    {
      label: 'Company',
      google: present(organizations?.map((o) => o.name)),
      card: contact.company,
      multiple: false,
      fallback: 'card'
    }
  );
  check(
    'urls',
    person.urls,
    () => person.urls?.some((u) => normal(u.value) === normal(contact.website)) ?? false,
    {
      label: 'Website',
      google: present(person.urls?.map((u) => u.value)),
      card: contact.website,
      multiple: true,
      fallback: 'both'
    }
  );
  const notes = card.biographies?.[0]?.value ?? '';
  const biographies = person.biographies?.filter((b) => b.value);
  check(
    'biographies',
    biographies,
    () => biographies?.some((b) => normal(b.value).includes(normal(notes))) ?? false,
    {
      label: 'Notes',
      google: present(biographies?.map((b) => b.value)),
      card: notes,
      multiple: true,
      fallback: 'both'
    }
  );
  // Custom fields are keyed, so new ones are appended next to the contact's existing ones.
  const custom = (person.userDefined ?? [])
    .filter((item) => item.key)
    .map((item) => ({ key: item.key ?? '', value: item.value ?? '' }));
  const existingCustom = [...custom];
  let customChanged = false;
  const answers = customFields(contact);
  for (const { label, value } of answers) {
    const found = custom.find((item) => normal(item.key) === normal(label));
    const shown = {
      key: `custom:${normal(label)}`,
      label,
      google: found ? [found.value] : [],
      card: value
    };
    if (!found) {
      if (decide(shown, 'added', ['card', 'google'], 'card') === 'card') {
        custom.push({ key: label, value });
        customChanged = true;
      }
    } else if (normal(found.value) === normal(value)) rows.push({ ...shown, kind: 'same' });
    else if (decide(shown, 'different', ['card', 'google'], 'card') === 'card') {
      found.value = value;
      customChanged = true;
    }
  }
  for (const item of existingCustom)
    if (!answers.some(({ label }) => normal(label) === normal(item.key)))
      rows.push({
        key: `custom:${normal(item.key)}`,
        label: item.key,
        google: [item.value],
        card: '',
        kind: 'kept'
      });
  if (customChanged) {
    update.userDefined = custom;
    fields.push('userDefined');
  }
  // Photos are shown as images, so the row carries Google's photo URL and a card placeholder.
  const googlePhoto = person.photos?.find((photo) => !photo.default);
  const photo = {
    key: 'photos',
    label: 'Photo',
    google: googlePhoto?.url ? [googlePhoto.url] : []
  };
  let addPhoto = false;
  if (contact.photo)
    addPhoto =
      decide(
        { ...photo, card: 'Photo' },
        googlePhoto ? 'different' : 'added',
        ['card', 'google'],
        googlePhoto ? 'google' : 'card'
      ) === 'card';
  else if (googlePhoto) rows.push({ ...photo, card: '', kind: 'kept' });
  return { update, fields, rows, addPhoto };
}

/** Whether a row asks the owner to choose between differing values. */
const needsChoice = (row: Row) => row.kind === 'different';
const decided = (row: Row): row is Decided => row.kind === 'added' || row.kind === 'different';

export const GooglePerson = {
  schema,
  from: toGooglePerson,
  match,
  merge,
  needsChoice,
  decided
} as const;
