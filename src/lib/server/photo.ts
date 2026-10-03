import sharp from 'sharp';

export async function normalizePhoto(data: string) {
  if (!data) return { ok: true, photo: '' } as const;
  const encoded = data.split(',')[1];
  if (!encoded)
    return { ok: false, message: 'The photo could not be read. Choose another image.' } as const;
  const buffer = Buffer.from(encoded, 'base64');
  if (buffer.length > 500_000)
    return {
      ok: false,
      message: 'Your photo is too large. Choose an image under 500 KB.'
    } as const;
  try {
    const photo = await sharp(buffer, { limitInputPixels: 16_000_000, animated: false })
      .rotate()
      .resize(512, 512, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return { ok: true, photo: `data:image/jpeg;base64,${photo.toString('base64')}` } as const;
  } catch {
    return {
      ok: false,
      message: 'The photo could not be decoded. Choose a JPEG, PNG, or WebP image.'
    } as const;
  }
}
