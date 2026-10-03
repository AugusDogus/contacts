import { PUBLIC_CONTACTS_DOMAIN } from '$app/env/public';

export function invitationUrl(token: string, origin: string) {
  const url = new URL(origin);
  if (url.hostname.endsWith(`.${PUBLIC_CONTACTS_DOMAIN}`)) {
    url.hostname = PUBLIC_CONTACTS_DOMAIN;
  }
  return `${url.origin}/${token}`;
}

export function contactPageUrl(slug: string, origin: string) {
  const url = new URL(origin);
  if (
    url.hostname === PUBLIC_CONTACTS_DOMAIN ||
    url.hostname.endsWith(`.${PUBLIC_CONTACTS_DOMAIN}`)
  )
    return `${url.protocol}//${slug}.${PUBLIC_CONTACTS_DOMAIN}`;
  return `${url.origin}/p/${slug}`;
}
