import { invitationTokenPattern } from './invitation-token';

export function contactRoute(url: URL, domain: string): string | undefined {
  if (!domain || !url.hostname.endsWith(`.${domain}`)) return;
  const slug = url.hostname.slice(0, -(domain.length + 1));
  if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug)) return;
  if (url.pathname === '/') return `/p/${slug}`;
  const token = url.pathname.slice(1);
  if (invitationTokenPattern.test(token) && !/^[a-z]{7}$/.test(token))
    return `/p/${slug}/i${url.pathname}`;
  if (url.pathname.startsWith('/i/') && invitationTokenPattern.test(url.pathname.slice(3)))
    return `/p/${slug}${url.pathname}`;
}
