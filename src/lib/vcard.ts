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

/** Services a custom answer can name, with their profile URL for a handle where one exists. */
const services: Record<string, { name: string; url?: (handle: string) => string }> = {
  discord: { name: 'Discord' },
  instagram: { name: 'Instagram', url: (h) => `https://instagram.com/${h}` },
  twitter: { name: 'X', url: (h) => `https://x.com/${h}` },
  x: { name: 'X', url: (h) => `https://x.com/${h}` },
  github: { name: 'GitHub', url: (h) => `https://github.com/${h}` },
  tiktok: { name: 'TikTok', url: (h) => `https://www.tiktok.com/@${h}` },
  threads: { name: 'Threads', url: (h) => `https://www.threads.net/@${h}` },
  bluesky: { name: 'Bluesky', url: (h) => `https://bsky.app/profile/${h}` },
  twitch: { name: 'Twitch', url: (h) => `https://twitch.tv/${h}` },
  youtube: { name: 'YouTube', url: (h) => `https://youtube.com/@${h}` },
  snapchat: { name: 'Snapchat', url: (h) => `https://snapchat.com/add/${h}` },
  telegram: { name: 'Telegram', url: (h) => `https://t.me/${h}` }
};

/**
 * A custom answer like "Discord username: name#1" as a social profile, which Apple Contacts
 * shows under its label, or null when the label doesn't name a known service.
 */
function socialProfile(label: string, value: string) {
  const key = label
    .toLowerCase()
    .replace(/\b(username|user name|user|handle|account|profile|id|tag|name)\b/g, '')
    .replace(/[^a-z]/g, '');
  const service = services[key];
  const handle = value.trim().replace(/^@/, '');
  if (!service || !handle) return null;
  const url = /^https?:\/\//i.test(handle)
    ? handle
    : service.url
      ? service.url(encodeURIComponent(handle))
      : `x-apple:${encodeURIComponent(handle)}`;
  // Parameter values with separators must be quoted; quotes themselves aren't allowed.
  const user = handle.replace(/"/g, '');
  return `X-SOCIALPROFILE;type=${service.name};x-user="${user}":${escape(url)}`;
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
        if (c.street || c.street2 || c.city || c.region || c.postalCode || c.country)
          lines.push(
            `ADR;TYPE=HOME:;${[c.street2, c.street, c.city, c.region, c.postalCode, c.country].map(escape).join(';')}`
          );
        if (c.birthday) lines.push(`BDAY:${c.birthday}`);
        if (c.company) lines.push(`ORG:${escape(c.company)}`);
        if (c.website) lines.push(`URL:${escape(c.website)}`);
        // Answers naming a service become social profiles. Everything else, including
        // pronouns (apps can't import them from a vCard), stays readable in the notes.
        const rest: string[] = [];
        for (const { label, value } of c.custom) {
          const profile = socialProfile(label, value);
          if (profile) lines.push(profile);
          else rest.push(`${label}: ${value}`);
        }
        const notes = [c.pronouns ? `Pronouns: ${c.pronouns}` : '', ...rest, c.notes]
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
