import type { ContentKeys } from './content-keys';

export type ContentLocale = 'en' | 'ar';

export interface FetchContentOptions {
  lang?: ContentLocale;
  fallback?: string;
}

export interface ResolvedContent {
  val: string;
  isActive: boolean;
  fallbackUsed: boolean;
}

// Route through the Next.js /api/icare proxy (matches api-client.ts) so the
// browser never talks directly to the backend and we avoid CORS. The proxy
// route at app/api/icare/[...path]/route.ts forwards to ICARE_API_BASE_URL.
// NEXT_PUBLIC_ICARE_API_URL bypasses the proxy when set (e.g. SSR/scripts).
const API_BASE =
  typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_ICARE_API_URL ?? '/api/icare')
    : '/api/icare';

// Image keys are stored as a single URL string (not bilingual JSON), so the
// `lang` query param has no effect on them. Stripping it client-side keeps the
// URL clean and matches the registered key's storage shape. The `.image`
// suffix is the registered key-naming convention and aligns with the
// discriminated `ContentKeys` type, where every image key is typed as
// `{ type: 'image' }`. See content-keys.d.ts.
const IMAGE_KEY_SUFFIX = '.image';

const isImageKey = (key: string): boolean => key.endsWith(IMAGE_KEY_SUFFIX);

// Abort ceiling covering headers AND body. A backend that returns headers
// fast but stalls on the body would otherwise leave `await res.json()` /
// `res.text()` blocked past the 60s prerender kill and fail the build.
// 5s is generous for a single text value and far under the prerender limit.
const CONTENT_FETCH_TIMEOUT_MS = 5000;

const withTimeout = () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONTENT_FETCH_TIMEOUT_MS);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
};

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
): Promise<ResolvedContent>;

// Untyped escape hatch — used by the useSiteContent shim where the key
// list spans more fields than the auto-generated ContentKeys type covers.
export async function fetchContent(
  key: string,
  opts?: FetchContentOptions,
): Promise<ResolvedContent>;

export async function fetchContent(
  key: string,
  opts: FetchContentOptions = {},
): Promise<ResolvedContent> {
  const lang = opts.lang ?? 'en';
  const fallback = opts.fallback ?? '';
  const url = buildUrl(key as string, lang);
  const result = await fetchContentOnce(url);
  if (result.ok) {
    return { val: result.val, isActive: result.isActive, fallbackUsed: result.fallbackUsed };
  }
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
    if (retried.ok) {
      return { val: retried.val, isActive: retried.isActive, fallbackUsed: retried.fallbackUsed };
    }
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
  return { val: fallback, isActive: false, fallbackUsed: true };
}

interface FetchOutcome {
  ok: boolean;
  status: number;
  val: string;
  isActive: boolean;
  fallbackUsed: boolean;
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
  const { signal, clear } = withTimeout();
  try {
    let res: Response | undefined;
    try {
      res = await fetch(url, { next: { revalidate: 300 }, signal });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn(`[content] network error:`, err);
      }
      return { ok: false, status: 0, val: '', isActive: false, fallbackUsed: true };
    }
    if (!res || !res.ok) {
      return { ok: false, status: res?.status ?? 0, val: '', isActive: false, fallbackUsed: true };
    }
    try {
      const payload = unwrapEnvelope(await res.json()) as { val?: string; isActive?: boolean; fallbackUsed?: boolean };
      return {
        ok: true,
        status: res.status,
        val: payload?.val ?? '',
        isActive: payload?.isActive !== false,
        fallbackUsed: Boolean(payload?.fallbackUsed),
      };
    } catch {
      // Non-JSON body — treat as missing rather than crashing the render.
      return { ok: false, status: res.status, val: '', isActive: false, fallbackUsed: true };
    }
  } finally {
    clear();
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
  const { signal, clear } = withTimeout();
  try {
    const res = await fetch(url, { next: { revalidate: 300 }, signal });
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
  } finally {
    clear();
  }
}