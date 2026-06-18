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

// 404 single-retry — covers the case where the BE has just been
// redeployed and the registry is mid-warm-up. After one retry we
// surface the fallback so the page renders instead of hanging.
const RETRY_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function buildUrl(key: string, lang: ContentLocale): string {
  const base = `${API_BASE}/api/v1/content/${encodeURIComponent(key)}`;
  return isImageKey(key) ? base : `${base}?lang=${lang}`;
}

// Type-safe overload — caller gets autocomplete on the ContentKeys type.
export async function fetchContent<K extends keyof ContentKeys>(
  key: K,
  opts?: FetchContentOptions,
): Promise<string>;

// Untyped escape hatch — used by the useSiteContent shim where the key
// list spans more fields than the auto-generated ContentKeys type covers.
export async function fetchContent(
  key: string,
  opts?: FetchContentOptions,
): Promise<string>;

export async function fetchContent(
  key: string,
  opts: FetchContentOptions = {},
): Promise<string> {
  const lang = opts.lang ?? 'en';
  const fallback = opts.fallback ?? '';
  const url = buildUrl(key as string, lang);
  const result = await fetchContentOnce(url);
  if (result.ok) return result.val;
  if (result.status === 404) {
    // Single retry for warm-up drift (deploy just shipped, registry not
    // yet populated). After one retry we return the fallback so the
    // page renders instead of stalling.
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        `[content] 404 for ${key as string}, retrying after ${RETRY_DELAY_MS}ms`,
      );
    }
    await sleep(RETRY_DELAY_MS);
    const retried = await fetchContentOnce(url);
    if (retried.ok) return retried.val;
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        `[content] still missing after retry: ${key as string} (${retried.status})`,
      );
    }
  } else if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(
      `[content] fetch failed for ${key as string}: status=${result.status}`,
    );
  }
  return fallback;
}

interface FetchOutcome {
  ok: boolean;
  status: number;
  val: string;
}

// BE wraps every `/api/*` response in `{ success: true, data }` via
// `AppResponseInterceptor`. The data payload we need lives at `envelope.data`.
// Older / non-canonical responses may pass through unwrapped — accept both.
function unwrapEnvelope(json: unknown): unknown {
  if (
    json &&
    typeof json === 'object' &&
    'data' in (json as Record<string, unknown>) &&
    (json as { success?: unknown }).success === true
  ) {
    return (json as { data: unknown }).data;
  }
  return json;
}

async function fetchContentOnce(url: string): Promise<FetchOutcome> {
  let res: Response | undefined;
  try {
    res = await fetch(url, { next: { revalidate: 300 } });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[content] network error:`, err);
    }
    return { ok: false, status: 0, val: '' };
  }
  if (!res || !res.ok) return { ok: false, status: res?.status ?? 0, val: '' };
  try {
    const payload = unwrapEnvelope(await res.json()) as { val?: string };
    return { ok: true, status: res.status, val: payload?.val ?? '' };
  } catch {
    // Non-JSON body — treat as missing rather than crashing the render.
    return { ok: false, status: res.status, val: '' };
  }
}

export async function fetchContentBatch<K extends keyof ContentKeys>(
  keys: K[],
  opts: { lang?: ContentLocale } = {},
): Promise<Record<K, string>> {
  if (keys.length === 0) return {} as Record<K, string>;
  const lang = opts.lang ?? 'en';
  const baseUrl = `${API_BASE}/api/v1/content?keys=${keys.join(',')}`;
  const url =
    keys.every((k) => isImageKey(k as string))
      ? baseUrl
      : `${baseUrl}&lang=${lang}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return {} as Record<K, string>;
    // BE returns `{ success: true, data: { key: { val, type, fallbackUsed } } }`.
    // Unwrap, then project each entry to its `.val` so callers receive a
    // plain `Record<K, string>` of resolved values.
    const payload = unwrapEnvelope(await res.json()) as
      | Record<string, { val?: string }>
      | undefined;
    const out: Record<K, string> = {} as Record<K, string>;
    if (!payload || typeof payload !== 'object') return out;
    for (const k of keys) {
      out[k] = payload[k as string]?.val ?? '';
    }
    return out;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[content] batch fetch failed:`, err);
    }
    return {} as Record<K, string>;
  }
}