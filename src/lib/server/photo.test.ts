import { expect, test } from 'bun:test';
import sharp from 'sharp';
import { normalizePhoto } from './photo';

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
