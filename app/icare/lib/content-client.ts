import type { ContentKeys } from './content-keys';

export type ContentLocale = 'en' | 'ar';

export interface FetchContentOptions {
  lang?: ContentLocale;
  fallback?: string;
}

const API_BASE =
  typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://backend.igroup.website')
    : 'https://backend.igroup.website';

// Image keys are stored as a single URL string (not bilingual JSON), so the
// `lang` query param has no effect on them. Stripping it client-side keeps the
// URL clean and matches the registered key's storage shape. The `.image`
// suffix is the registered key-naming convention and aligns with the
// discriminated `ContentKeys` type, where every image key is typed as
// `{ type: 'image' }`. See content-keys.d.ts.
const IMAGE_KEY_SUFFIX = '.image';

const isImageKey = (key: string): boolean => key.endsWith(IMAGE_KEY_SUFFIX);

export async function fetchContent<K extends keyof ContentKeys>(
  key: K,
  opts: FetchContentOptions = {},
): Promise<string> {
  const baseUrl = `${API_BASE}/api/v1/content/${encodeURIComponent(key)}`;
  // Image keys don't carry language variants — drop the lang param to keep
  // the URL explicit about what the BE is expected to return.
  const url = isImageKey(key)
    ? baseUrl
    : `${baseUrl}?lang=${opts.lang ?? 'en'}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn(`[content] missing key: ${key} (${res.status})`);
      }
      return opts.fallback ?? '';
    }
    const data = (await res.json()) as { val: string; fallbackUsed: boolean };
    return data.val;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[content] fetch failed for ${key}:`, err);
    }
    return opts.fallback ?? '';
  }
}

export async function fetchContentBatch<K extends keyof ContentKeys>(
  keys: K[],
  opts: { lang?: ContentLocale } = {},
): Promise<Record<K, string>> {
  if (keys.length === 0) return {} as Record<K, string>;
  const baseUrl = `${API_BASE}/api/v1/content?keys=${keys.join(',')}`;
  // If every key in the batch is an image, no lang param is needed.
  // Mixed batches still need lang for the text keys.
  const url = keys.every(isImageKey)
    ? baseUrl
    : `${baseUrl}&lang=${opts.lang ?? 'en'}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return {} as Record<K, string>;
    return (await res.json()) as Record<K, string>;
  } catch {
    return {} as Record<K, string>;
  }
}
