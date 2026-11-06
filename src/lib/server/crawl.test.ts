import { describe, expect, test } from 'bun:test';
import { Crawl } from './crawl';

const origin = 'https://contacts.exchange';

describe('crawler documents', () => {
  test('robots.txt keeps crawlers out of the signed-in app and points at the sitemap', () => {
    const lines = Crawl.robotsTxt(origin).split('\n');
    expect(lines[0]).toBe('User-agent: *');
    expect(lines).toContain('Disallow: /people');
    expect(lines).toContain('Disallow: /api/');
    expect(lines).toContain(`Sitemap: ${origin}/sitemap.xml`);
    // Public pages and people's invitation pages stay crawlable so their own robots meta applies.
    for (const path of ['/', '/about', '/privacy', '/p/', '/i/'])
      expect(lines).not.toContain(`Disallow: ${path}`);
  });

  test('the sitemap lists each public page by its absolute URL', () => {
    const xml = Crawl.sitemapXml(origin);
    expect(xml).toStartWith('<?xml version="1.0" encoding="UTF-8"?>');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([`${origin}/`, `${origin}/about`, `${origin}/privacy`]);
  });
});
