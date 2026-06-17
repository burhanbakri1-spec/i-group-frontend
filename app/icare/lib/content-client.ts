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

export async function fetchContent<K extends keyof ContentKeys>(
  key: K,
  opts: FetchContentOptions = {},
): Promise<string> {
  const lang = opts.lang ?? 'en';
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/content/${encodeURIComponent(key)}?lang=${lang}`,
      { next: { revalidate: 300 } },
    );
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
  const lang = opts.lang ?? 'en';
  if (keys.length === 0) return {} as Record<K, string>;
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/content?keys=${keys.join(',')}&lang=${lang}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return {} as Record<K, string>;
    return (await res.json()) as Record<K, string>;
  } catch {
    return {} as Record<K, string>;
  }
}
