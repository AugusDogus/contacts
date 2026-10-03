import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max);
export const birthdaySchema = z.string().refine((value) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value <= new Date().toISOString().slice(0, 10) &&
    Number(value.slice(0, 4)) >= 1900
  );
}, 'Enter a valid birthday in the past.');

export const contactInput = z
  .object({
    firstName: text(80).min(1, 'Add your first name.'),
    lastName: text(80).min(1, 'Add your last name.'),
    email: z.union([z.literal(''), z.email().max(254)]),
    phone: text(40).refine(
      (value) => !value || /^[+\d\s().\-x#]+$/.test(value),
      'Enter a valid phone number.'
    ),
    street: text(200),
    city: text(100),
    region: text(100),
    postalCode: text(30),
    country: text(100),
    birthday: birthdaySchema,
    pronouns: text(60),
    company: text(100),
    website: z.union([
      z.literal(''),
      z
        .url()
        .max(500)
        .refine((value) => /^https?:\/\//.test(value), 'Use an https:// or http:// link.')
    ]),
    notes: text(2000),
    photo: z
      .string()
      .max(750_000)
      .refine(
        (value) => !value || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value),
        'Choose a JPEG, PNG, or WebP photo under 500 KB.'
      )
  })
  .refine((value) => Boolean(value.email || value.phone), {
    message: 'Add an email address or phone number so your friend can reach you.',
    path: ['email']
  });

export type ContactInput = z.infer<typeof contactInput>;
export const contactSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  invitationId: z.string().nullable(),
  linkedUserId: z.string().nullable(),
  createdAt: z.number(),
  data: contactInput,
  favorite: z.boolean()
});
export type Contact = z.infer<typeof contactSchema>;

export const Contact = {
  empty: (): ContactInput => ({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    birthday: '',
    pronouns: '',
    company: '',
    website: '',
    notes: '',
    photo: ''
  }),
  name: (contact: ContactInput) => `${contact.firstName} ${contact.lastName}`,
  initials: (contact: ContactInput) =>
    `${contact.firstName.slice(0, 1)}${contact.lastName.slice(0, 1)}`,
  birthdayLabel: (birthday: string) =>
    birthday
      ? new Date(`${birthday}T12:00:00`).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      : '',
  daysUntilBirthday(birthday: string, now = new Date()): number {
    if (!birthday) return Infinity;
    const month = Number(birthday.slice(5, 7)) - 1;
    const day = Number(birthday.slice(8, 10));
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let next = new Date(now.getFullYear(), month, day);
    if (next < today) next = new Date(now.getFullYear() + 1, month, day);
    return Math.round((next.getTime() - today.getTime()) / 86_400_000);
  }
} as const;
