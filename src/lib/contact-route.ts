export function contactRoute(url: URL, domain: string): string | undefined {
  if (!domain || !url.hostname.endsWith(`.${domain}`)) return;
  const slug = url.hostname.slice(0, -(domain.length + 1));
  if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug)) return;
  if (url.pathname === '/') return `/p/${slug}`;
  if (/^\/i\/[A-Za-z0-9_-]{43}$/.test(url.pathname)) return `/p/${slug}${url.pathname}`;
}
