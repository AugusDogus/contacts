import { PUBLIC_CONTACTS_DOMAIN } from '$app/env/public';

export function invitationUrl(token: string, origin: string, slug: string) {
  const pageUrl = contactPageUrl(slug, origin);
  const prefix = new URL(pageUrl).pathname === '/' ? '' : '/i';
  return `${pageUrl}${prefix}/${token}`;
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
