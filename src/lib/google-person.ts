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
// Loose entries keep Google's own labels, such as "work", when a list is sent back.
const entry = <T extends z.ZodRawShape>(shape: T) => z.array(z.looseObject(shape)).optional();
const schema = z.object({
  resourceName: z.string().regex(/^people\/[A-Za-z0-9_-]+$/),
  etag: text,
  names: entry({ givenName: text, familyName: text }),
  emailAddresses: entry({ value: text }),
  phoneNumbers: entry({ value: text, canonicalForm: text }),
  addresses: entry({
    streetAddress: text,
    extendedAddress: text,
    city: text,
    region: text,
    postalCode: text,
    country: text,
    formattedValue: text
  }),
  birthdays: entry({
    date: z
      .object({
        year: z.number().optional(),
        month: z.number().optional(),
        day: z.number().optional()
      })
      .optional()
  }),
  organizations: entry({ name: text }),
  urls: entry({ value: text }),
  biographies: entry({ value: text }),
  userDefined: entry({ key: text, value: text }),
  photos: z.array(z.object({ default: z.boolean().optional() })).optional()
});

/** The parts of a Google contact used to match and merge cards. */
export type GooglePerson = z.infer<typeof schema>;
/** How to settle a detail Google already has with a different value. */
export type Resolution = 'google' | 'card' | 'both';
export type Choice = {
  key: string;
  label: string;
  google: string;
  card: string;
  options: Resolution[];
  selected: Resolution;
};
export type Decisions = Partial<Record<string, Resolution>>;
type Body = ReturnType<typeof toGooglePerson>;
type ListKey = Exclude<keyof Body, 'userDefined'>;

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
const birthday = (date?: { year?: number; month?: number; day?: number }) =>
  date?.month && date.day
    ? [date.year, date.month, date.day]
        .filter((part) => part !== undefined)
        .map((part) => String(part).padStart(2, '0'))
        .join('-')
    : '';
// Read-only fields Google rejects or ignores when a list is written back.
const writable = ({
  metadata: _metadata,
  formattedType: _formattedType,
  canonicalForm: _canonicalForm,
  ...rest
}: Record<string, unknown>) => rest;

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
 * Fills details Google lacks. Details Google has with different values become choices,
 * settled by `decisions` or, without one, by the default for that detail.
 */
function merge(contact: ContactInput, person: GooglePerson, decisions: Decisions = {}) {
  const card = toGooglePerson(contact);
  const update: Partial<Body> & { etag?: string } = { etag: person.etag };
  const fields: string[] = [];
  const choices: Choice[] = [];
  function settle(choice: Omit<Choice, 'selected'>, fallback: Resolution) {
    const decided = decisions[choice.key];
    const selected = decided && choice.options.includes(decided) ? decided : fallback;
    choices.push({ ...choice, selected });
    return selected;
  }
  function check<K extends ListKey>(
    key: K,
    existing: Record<string, unknown>[] | undefined,
    same: () => boolean,
    choice: { label: string; google: string; card: string; multiple: boolean; fallback: Resolution }
  ) {
    const value = card[key];
    if (!value) return;
    if (!existing?.length) {
      update[key] = value;
      fields.push(key);
      return;
    }
    if (same()) return;
    const { label, google, card: shown, multiple, fallback } = choice;
    const options: Resolution[] = multiple ? ['both', 'card', 'google'] : ['card', 'google'];
    const selected = settle({ key, label, google, card: shown, options }, fallback);
    if (selected === 'google') return;
    if (key === 'biographies' && selected === 'both') {
      // Notes are one block of text, so keeping both appends the card's notes.
      const notes = join(
        [...existing.map((b) => String(b.value ?? '')), card.biographies?.[0]?.value],
        '\n\n'
      );
      update.biographies = [{ value: notes, contentType: 'TEXT' }];
    } else
      update[key] = (
        selected === 'both' ? [...existing.map(writable), ...value] : value
      ) as Body[K];
    fields.push(key);
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
    {
      label: 'Name',
      google: join(person.names?.map((n) => join([n.givenName, n.familyName], ' ')) ?? []),
      card: name,
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
      google: join(person.emailAddresses?.map((e) => e.value) ?? []),
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
      google: join(person.phoneNumbers?.map((n) => n.value) ?? []),
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
      google: join(
        person.addresses?.map(
          (a) => a.formattedValue?.replace(/\n/g, ', ') || join(components.map((k) => a[k]))
        ) ?? [],
        ' / '
      ),
      card: join(Object.values(address)),
      multiple: true,
      // People who send a new address have usually moved.
      fallback: 'card'
    }
  );
  check(
    'birthdays',
    person.birthdays?.filter((b) => birthday(b.date)),
    () =>
      person.birthdays?.some(
        (b) =>
          birthday(b.date) === contact.birthday || birthday(b.date) === contact.birthday.slice(5)
      ) ?? false,
    {
      label: 'Birthday',
      google: join(person.birthdays?.map((b) => birthday(b.date)) ?? []),
      card: contact.birthday,
      multiple: false,
      fallback: 'card'
    }
  );
  check(
    'organizations',
    person.organizations?.filter((o) => o.name),
    () => person.organizations?.some((o) => normal(o.name) === normal(contact.company)) ?? false,
    {
      label: 'Company',
      google: join(person.organizations?.map((o) => o.name) ?? []),
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
      google: join(person.urls?.map((u) => u.value) ?? []),
      card: contact.website,
      multiple: true,
      fallback: 'both'
    }
  );
  const notes = card.biographies?.[0]?.value ?? '';
  check(
    'biographies',
    person.biographies?.filter((b) => b.value),
    () => person.biographies?.some((b) => normal(b.value).includes(normal(notes))) ?? false,
    {
      label: 'Notes',
      google: join(person.biographies?.map((b) => b.value) ?? []),
      card: notes,
      multiple: true,
      fallback: 'both'
    }
  );
  // Custom fields are keyed, so new ones are appended next to the contact's existing ones.
  const custom = (person.userDefined ?? [])
    .filter((item) => item.key)
    .map((item) => ({ key: item.key ?? '', value: item.value ?? '' }));
  let customChanged = false;
  for (const { label, value } of contact.custom) {
    const found = custom.find((item) => normal(item.key) === normal(label));
    if (!found) {
      custom.push({ key: label, value });
      customChanged = true;
    } else if (normal(found.value) !== normal(value)) {
      const selected = settle(
        {
          key: `custom:${normal(label)}`,
          label,
          google: found.value,
          card: value,
          options: ['card', 'google']
        },
        'card'
      );
      if (selected === 'card') {
        found.value = value;
        customChanged = true;
      }
    }
  }
  if (customChanged) {
    update.userDefined = custom;
    fields.push('userDefined');
  }
  const addPhoto = Boolean(contact.photo) && !person.photos?.some((photo) => !photo.default);
  return { update, fields, choices, addPhoto };
}

export const GooglePerson = {
  schema,
  from: toGooglePerson,
  match,
  merge
} as const;
