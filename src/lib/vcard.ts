import type { Contact } from './contact';

function escape(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n|\r/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

// vCard 3.0 folds at 75 octets, preserving complete UTF-8 characters.
function fold(line: string) {
  const encoder = new TextEncoder();
  let bytes = 0;
  let output = '';
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) {
      output += '\r\n ';
      bytes = 1;
    }
    output += char;
    bytes += size;
  }
  return output;
}

export function toVCard(contacts: Contact[]) {
  return (
    contacts
      .map(({ id, data: c }) => {
        const lines = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `UID:${id}`,
          `N:${escape(c.lastName)};${escape(c.firstName)};;;`,
          `FN:${escape(`${c.firstName} ${c.lastName}`)}`
        ];
        if (c.email) lines.push(`EMAIL;TYPE=INTERNET:${escape(c.email)}`);
        if (c.phone) lines.push(`TEL;TYPE=CELL:${escape(c.phone)}`);
        if (c.street || c.city || c.region || c.postalCode || c.country)
          lines.push(
            `ADR;TYPE=HOME:;;${[c.street, c.city, c.region, c.postalCode, c.country].map(escape).join(';')}`
          );
        if (c.birthday) lines.push(`BDAY:${c.birthday}`);
        if (c.company) lines.push(`ORG:${escape(c.company)}`);
        if (c.website) lines.push(`URL:${escape(c.website)}`);
        const notes = [
          c.pronouns ? `Pronouns: ${c.pronouns}` : '',
          ...c.custom.map(({ label, value }) => `${label}: ${value}`),
          c.notes
        ]
          .filter(Boolean)
          .join('\n');
        if (notes) lines.push(`NOTE:${escape(notes)}`);
        if (c.photo) {
          const match = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(c.photo);
          if (match?.[1] && match[2])
            lines.push(`PHOTO;ENCODING=b;TYPE=${match[1].toUpperCase()}:${match[2]}`);
        }
        lines.push('END:VCARD');
        return lines.map(fold).join('\r\n');
      })
      .join('\r\n') + '\r\n'
  );
}
