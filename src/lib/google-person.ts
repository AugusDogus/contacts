import { z } from 'zod';
import type { ContactInput } from './contact';

export function toGooglePerson(contact: ContactInput) {
  const notes = [contact.pronouns ? `Pronouns: ${contact.pronouns}` : '', contact.notes]
    .filter(Boolean)
    .join('\n');
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
    ...(notes ? { biographies: [{ value: notes, contentType: 'TEXT' }] } : {}),
    ...(contact.custom.length
      ? { userDefined: contact.custom.map(({ label, value }) => ({ key: label, value })) }
      : {})
  };
}

const text = z.string().optional();
const schema = z.object({
  resourceName: z.string().regex(/^people\/[A-Za-z0-9_-]+$/),
  etag: text,
  names: z.array(z.object({ givenName: text, familyName: text })).optional(),
  emailAddresses: z.array(z.object({ value: text })).optional(),
  phoneNumbers: z.array(z.object({ value: text, canonicalForm: text })).optional(),
  addresses: z
    .array(
      z.object({
        streetAddress: text,
        extendedAddress: text,
        city: text,
        region: text,
        postalCode: text,
        country: text,
        formattedValue: text
      })
    )
    .optional(),
  birthdays: z
    .array(
      z.object({
        date: z
          .object({
            year: z.number().optional(),
            month: z.number().optional(),
            day: z.number().optional()
          })
          .optional()
      })
    )
    .optional(),
  organizations: z.array(z.object({ name: text })).optional(),
  urls: z.array(z.object({ value: text })).optional(),
  biographies: z.array(z.object({ value: text })).optional(),
  userDefined: z.array(z.object({ key: text, value: text })).optional(),
  photos: z.array(z.object({ default: z.boolean().optional() })).optional()
});

/** The parts of a Google contact used to match and merge cards. */
export type GooglePerson = z.infer<typeof schema>;
/** A detail Google already has with a different value. Google's value is kept. */
export type Conflict = { field: string; google: string; card: string };
type Body = ReturnType<typeof toGooglePerson>;

const normal = (value = '') => value.trim().toLowerCase().replace(/\s+/g, ' ');
const digits = (value = '') => value.replace(/\D/g, '');
function samePhone(a = '', b = '') {
  const [x, y] = [digits(a), digits(b)];
  if (!x || !y) return false;
  // Compare national numbers so "+1 312…" matches "(312)…".
  return x.length >= 10 && y.length >= 10 ? x.slice(-10) === y.slice(-10) : x === y;
}
const join = (values: (string | undefined)[]) => values.filter(Boolean).join(', ');
const birthday = (date?: { year?: number; month?: number; day?: number }) =>
  date?.month && date.day
    ? [date.year, date.month, date.day]
        .filter((part) => part !== undefined)
        .map((part) => String(part).padStart(2, '0'))
        .join('-')
    : '';

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

/** Fills details Google lacks and lists those it has with different values. */
function merge(contact: ContactInput, person: GooglePerson) {
  const card = toGooglePerson(contact);
  const update: Partial<Body> & { etag?: string } = { etag: person.etag };
  const fields: string[] = [];
  const conflicts: Conflict[] = [];
  function check<K extends keyof Body>(
    key: K,
    existing: unknown[] | undefined,
    same: () => boolean,
    label: string,
    shown: () => { google: string; card: string }
  ) {
    const value = card[key];
    if (!value) return;
    if (!existing?.length) {
      update[key] = value;
      fields.push(key);
    } else if (!same()) conflicts.push({ field: label, ...shown() });
  }
  const name = `${contact.firstName} ${contact.lastName}`;
  check(
    'names',
    person.names?.filter((n) => n.givenName || n.familyName),
    () =>
      person.names?.some(
        (n) =>
          normal(n.givenName) === normal(contact.firstName) &&
          normal(n.familyName) === normal(contact.lastName)
      ) ?? false,
    'Name',
    () => ({
      google: join(
        person.names?.map((n) => [n.givenName, n.familyName].filter(Boolean).join(' ')) ?? []
      ),
      card: name
    })
  );
  check(
    'emailAddresses',
    person.emailAddresses,
    () => person.emailAddresses?.some((e) => normal(e.value) === normal(contact.email)) ?? false,
    'Email',
    () => ({ google: join(person.emailAddresses?.map((e) => e.value) ?? []), card: contact.email })
  );
  check(
    'phoneNumbers',
    person.phoneNumbers,
    () => person.phoneNumbers?.some((n) => samePhone(n.value, contact.phone)) ?? false,
    'Phone',
    () => ({ google: join(person.phoneNumbers?.map((n) => n.value) ?? []), card: contact.phone })
  );
  const address = {
    streetAddress: contact.street,
    extendedAddress: contact.street2,
    city: contact.city,
    region: contact.region,
    postalCode: contact.postalCode,
    country: contact.country
  };
  check(
    'addresses',
    person.addresses,
    () =>
      person.addresses?.some((existing) =>
        Object.entries(address).every(
          ([key, value]) =>
            !value || normal(existing[key as keyof typeof address]) === normal(value)
        )
      ) ?? false,
    'Address',
    () => ({
      google:
        person.addresses
          ?.map(
            (a) =>
              a.formattedValue ||
              join(Object.keys(address).map((k) => a[k as keyof typeof address]))
          )
          .join(' / ') ?? '',
      card: join(Object.values(address))
    })
  );
  check(
    'birthdays',
    person.birthdays?.filter((b) => birthday(b.date)),
    () =>
      person.birthdays?.some(
        (b) =>
          birthday(b.date) === contact.birthday || birthday(b.date) === contact.birthday.slice(5)
      ) ?? false,
    'Birthday',
    () => ({
      google: join(person.birthdays?.map((b) => birthday(b.date)) ?? []),
      card: contact.birthday
    })
  );
  check(
    'organizations',
    person.organizations?.filter((o) => o.name),
    () => person.organizations?.some((o) => normal(o.name) === normal(contact.company)) ?? false,
    'Company',
    () => ({ google: join(person.organizations?.map((o) => o.name) ?? []), card: contact.company })
  );
  check(
    'urls',
    person.urls,
    () => person.urls?.some((u) => normal(u.value) === normal(contact.website)) ?? false,
    'Website',
    () => ({ google: join(person.urls?.map((u) => u.value) ?? []), card: contact.website })
  );
  const notes = card.biographies?.[0]?.value ?? '';
  check(
    'biographies',
    person.biographies?.filter((b) => b.value),
    () => person.biographies?.some((b) => normal(b.value).includes(normal(notes))) ?? false,
    'Notes',
    () => ({ google: join(person.biographies?.map((b) => b.value) ?? []), card: notes })
  );
  // Custom fields are keyed, so new ones are appended next to the contact's existing ones.
  const existing = (person.userDefined ?? []).filter((entry) => entry.key);
  const added = [];
  for (const { label, value } of contact.custom) {
    const found = existing.find((entry) => normal(entry.key) === normal(label));
    if (!found) added.push({ key: label, value });
    else if (normal(found.value) !== normal(value))
      conflicts.push({ field: label, google: found.value ?? '', card: value });
  }
  if (added.length) {
    update.userDefined = [
      ...existing.map(({ key, value }) => ({ key: key ?? '', value: value ?? '' })),
      ...added
    ];
    fields.push('userDefined');
  }
  const addPhoto = Boolean(contact.photo) && !person.photos?.some((photo) => !photo.default);
  return { update, fields, conflicts, addPhoto };
}

export const GooglePerson = {
  schema,
  from: toGooglePerson,
  match,
  merge
} as const;
