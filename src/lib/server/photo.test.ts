import { describe, expect, test } from 'bun:test';
import sharp from 'sharp';
import { normalizePhoto, photoFromUrl } from './photo';

test('rejects non-images even when disguised as a data URL', async () => {
  expect(
    (
      await normalizePhoto(
        `data:image/jpeg;base64,${Buffer.from('not a photo').toString('base64')}`
      )
    ).ok
  ).toBe(false);
});
test('re-encodes photos and removes metadata', async () => {
  const input = await sharp({
    create: { width: 800, height: 600, channels: 3, background: '#3659d9' }
  })
    .withMetadata()
    .png()
    .toBuffer();
  const result = await normalizePhoto(`data:image/png;base64,${input.toString('base64')}`);
  if (!result.ok) throw new Error(result.message);
  const encoded = result.photo.split(',')[1];
  if (!encoded) throw new Error('No normalized photo.');
  const metadata = await sharp(Buffer.from(encoded, 'base64')).metadata();
  expect(metadata.width).toBe(512);
  expect(metadata.height).toBe(512);
  expect(metadata.exif).toBeUndefined();
  expect(metadata.format).toBe('jpeg');
});

describe('photos from a link', () => {
  const png = () =>
    sharp({ create: { width: 64, height: 64, channels: 3, background: '#3659d9' } })
      .png()
      .toBuffer();
  const image = async () =>
    new Response(new Uint8Array(await png()), { headers: { 'content-type': 'image/png' } });
  const recorder = (respond: (url: URL) => Response | Promise<Response>) => {
    const requested: string[] = [];
    const fetch = async (url: URL) => {
      requested.push(url.href);
      return respond(url);
    };
    return { requested, fetch };
  };

  test('downloads and re-encodes an https image', async () => {
    const { fetch } = recorder(image);
    const result = await photoFromUrl('https://images.example/me.png', fetch);
    if (!result.ok) throw new Error(result.message);
    expect(result.photo).toStartWith('data:image/jpeg;base64,');
  });

  test('follows redirects, checking each hop through the same fetcher', async () => {
    const { requested, fetch } = recorder((url) =>
      url.pathname === '/me.png'
        ? new Response(null, { status: 302, headers: { location: '/cdn/me.png' } })
        : image()
    );
    expect((await photoFromUrl('https://images.example/me.png', fetch)).ok).toBe(true);
    expect(requested).toEqual([
      'https://images.example/me.png',
      'https://images.example/cdn/me.png'
    ]);
  });

  test('refuses non-https links, including redirects to them, before fetching them', async () => {
    const plain = recorder(image);
    expect((await photoFromUrl('http://images.example/me.png', plain.fetch)).ok).toBe(false);
    expect(plain.requested).toEqual([]);
    const downgrade = recorder(
      () => new Response(null, { status: 301, headers: { location: 'http://10.0.0.1/me.png' } })
    );
    expect((await photoFromUrl('https://images.example/me.png', downgrade.fetch)).ok).toBe(false);
    expect(downgrade.requested).toEqual(['https://images.example/me.png']);
  });

  test('explains when the link is not an image, too large, or unreachable', async () => {
    const html = recorder(
      () => new Response('<html>', { headers: { 'content-type': 'text/html' } })
    );
    const notImage = await photoFromUrl('https://images.example/page', html.fetch);
    expect(notImage.ok || notImage.message).toContain('not an image');

    const huge = recorder(
      () => new Response(new Uint8Array(6_000_000), { headers: { 'content-type': 'image/png' } })
    );
    const tooLarge = await photoFromUrl('https://images.example/huge.png', huge.fetch);
    expect(tooLarge.ok || tooLarge.message).toContain('5 MB');

    const blocked = await photoFromUrl('https://internal.example/me.png', async () => {
      throw new TypeError('hostname must resolve only to public-routable addresses');
    });
    expect(blocked.ok || blocked.message).toContain('Could not download');
  });

  test('gives up after too many redirects', async () => {
    const loop = recorder(
      (url) => new Response(null, { status: 302, headers: { location: `${url.href}x` } })
    );
    const result = await photoFromUrl('https://images.example/a', loop.fetch);
    expect(result.ok || result.message).toContain('redirected too many times');
    expect(loop.requested).toHaveLength(4);
  });
});
