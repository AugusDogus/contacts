import sharp from 'sharp';

type PhotoResult = { ok: true; photo: string } | { ok: false; message: string };
const failure = (message: string): PhotoResult => ({ ok: false, message });

/** Fetches a URL. Production passes an SSRF-safe transport that refuses non-public addresses. */
export type PhotoFetch = (url: URL, init: RequestInit) => Response | Promise<Response>;

const MAX_DOWNLOAD_BYTES = 5_000_000;
const MAX_REDIRECTS = 3;

/** Resizes to a 512px square JPEG, which also strips metadata such as location. */
async function encode(buffer: Buffer): Promise<PhotoResult> {
  try {
    const photo = await sharp(buffer, { limitInputPixels: 16_000_000, animated: false })
      .rotate()
      .resize(512, 512, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return { ok: true, photo: `data:image/jpeg;base64,${photo.toString('base64')}` };
  } catch {
    return failure('The photo could not be decoded. Choose a JPEG, PNG, or WebP image.');
  }
}

export async function normalizePhoto(data: string): Promise<PhotoResult> {
  if (!data) return { ok: true, photo: '' };
  const encoded = data.split(',')[1];
  if (!encoded) return failure('The photo could not be read. Choose another image.');
  const buffer = Buffer.from(encoded, 'base64');
  if (buffer.length > 500_000)
    return failure('Your photo is too large. Choose an image under 500 KB.');
  return encode(buffer);
}

/** Reads a body, giving up once it passes the limit instead of buffering all of it. */
async function readLimited(response: Response): Promise<Buffer | null> {
  const reader = response.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return Buffer.concat(chunks);
    size += value.byteLength;
    if (size > MAX_DOWNLOAD_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
}

/** Downloads a photo from a public https link, following up to three redirects. */
export async function photoFromUrl(link: string, fetch: PhotoFetch): Promise<PhotoResult> {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return failure('That photo link is not a valid URL. Use a direct https:// link to an image.');
  }
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (url.protocol !== 'https:')
      return failure('Photo links must use https://. Use a direct https:// link to an image.');
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { accept: 'image/*' },
        signal: AbortSignal.timeout(10_000)
      });
    } catch {
      return failure(
        `Could not download the photo from ${url.host}. Check that the link is public and opens without signing in.`
      );
    }
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      const location = response.headers.get('location');
      if (!location) return failure(`The photo link at ${url.host} redirected nowhere.`);
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      return failure(
        `The photo link returned HTTP ${response.status}. Check that it opens in a browser without signing in.`
      );
    }
    if (!response.headers.get('content-type')?.startsWith('image/')) {
      await response.body?.cancel();
      return failure('That link is not an image. Use a direct link to a JPEG, PNG, or WebP file.');
    }
    const buffer = await readLimited(response);
    if (!buffer) return failure('The photo is larger than 5 MB. Use a smaller image.');
    return encode(buffer);
  }
  return failure('The photo link redirected too many times. Use a direct link to the image.');
}
