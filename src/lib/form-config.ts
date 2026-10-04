import { z } from 'zod';
import type { ContactInput, CustomAnswer } from './contact';

export const requirableFields = [
  'email',
  'phone',
  'address',
  'birthday',
  'photo',
  'pronouns',
  'company',
  'website',
  'notes'
] as const;
export type RequirableField = (typeof requirableFields)[number];
type ContactField = keyof Omit<ContactInput, 'custom'>;

const labels: Record<RequirableField, string> = {
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  birthday: 'Birthday',
  photo: 'Photo',
  pronouns: 'Pronouns',
  company: 'Company',
  website: 'Website',
  notes: 'Notes'
};
// Region stays optional because many countries have none.
const inputs: Record<RequirableField, ContactField[]> = {
  email: ['email'],
  phone: ['phone'],
  address: ['street', 'city', 'postalCode', 'country'],
  birthday: ['birthday'],
  photo: ['photo'],
  pronouns: ['pronouns'],
  company: ['company'],
  website: ['website'],
  notes: ['notes']
};
const messages: Record<RequirableField, string> = {
  email: 'Add your email address.',
  phone: 'Add your phone number.',
  address: 'Add your mailing address.',
  birthday: 'Add your birthday.',
  photo: 'Add a photo of yourself.',
  pronouns: 'Add your pronouns.',
  company: 'Add your company.',
  website: 'Add your website.',
  notes: 'Add a note.'
};

const schema = z
  .object({
    required: z.array(z.enum(requirableFields)),
    custom: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]{1,40}$/),
          label: z.string().trim().min(1, 'Name each custom field.').max(40),
          required: z.boolean()
        })
      )
      .max(10, 'You can add up to 10 custom fields.')
  })
  .refine(
    ({ custom }) => new Set(custom.map(({ label }) => label.toLowerCase())).size === custom.length,
    { message: 'Give each custom field a different name.', path: ['custom'] }
  );

/** What an owner asks friends for, beyond a name and an email or phone. */
export type FormConfig = z.infer<typeof schema>;
type Missing = { field: string; message: string };

const empty = (): FormConfig => ({ required: [], custom: [] });

export const FormConfig = {
  schema,
  empty,
  labels,
  /** Profiles saved before this setting existed have no config. */
  parse: (value: unknown): FormConfig => {
    const parsed = schema.safeParse(value);
    return parsed.success ? parsed.data : empty();
  },
  requires: (config: FormConfig, input: ContactField) =>
    config.required.some((field) => inputs[field].includes(input)),
  /** Keeps answers only for the owner's fields, labelled as the owner named them. */
  answers: (config: FormConfig, submitted: CustomAnswer[]): CustomAnswer[] =>
    config.custom
      .map(({ id, label }) => ({
        id,
        label,
        value: submitted.find((answer) => answer.id === id)?.value.trim() ?? ''
      }))
      .filter(({ value }) => value),
  /** Saved cards come from other people's forms, so match fields by name. */
  prefill: (config: FormConfig, card: ContactInput): CustomAnswer[] =>
    config.custom.map(({ id, label }) => ({
      id,
      label,
      value:
        card.custom.find(
          (answer) => answer.id === id || answer.label.toLowerCase() === label.toLowerCase()
        )?.value ?? ''
    })),
  /** The first unanswered requirement, in form order. */
  missing: (config: FormConfig, contact: ContactInput): Missing | null => {
    for (const field of requirableFields) {
      if (!config.required.includes(field)) continue;
      const blank = inputs[field].find((input) => !contact[input].trim());
      if (blank) return { field: blank, message: messages[field] };
    }
    for (const { id, label, required } of config.custom) {
      if (required && !contact.custom.some((answer) => answer.id === id && answer.value.trim()))
        return { field: `custom-${id}`, message: `Add your ${label}.` };
    }
    return null;
  }
} as const;
