import type { ContactInput } from './contact';

export function toGooglePerson(contact: ContactInput) {
  const notes = [contact.pronouns ? `Pronouns: ${contact.pronouns}` : '', contact.notes]
    .filter(Boolean)
    .join('\n');
  return {
    names: [{ givenName: contact.firstName, familyName: contact.lastName }],
    ...(contact.email ? { emailAddresses: [{ value: contact.email, type: 'home' }] } : {}),
    ...(contact.phone ? { phoneNumbers: [{ value: contact.phone, type: 'mobile' }] } : {}),
    ...(contact.street || contact.city || contact.region || contact.postalCode || contact.country
      ? {
          addresses: [
            {
              type: 'home',
              streetAddress: contact.street,
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
