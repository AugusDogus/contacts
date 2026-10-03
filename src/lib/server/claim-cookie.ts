import { PUBLIC_CONTACTS_DOMAIN } from '$app/env/public';

// Only the short-lived claim receipt spans the wildcard domain. Auth cookies stay host-only.
export function claimCookieDomain(hostname: string) {
  return hostname === PUBLIC_CONTACTS_DOMAIN || hostname.endsWith(`.${PUBLIC_CONTACTS_DOMAIN}`)
    ? `.${PUBLIC_CONTACTS_DOMAIN}`
    : undefined;
}
