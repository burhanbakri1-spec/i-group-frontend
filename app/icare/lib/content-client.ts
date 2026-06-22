/**
 * content-client.ts — Bridge to the new dynamic content system.
 *
 * The backend exposes a single public envelope endpoint:
 *   GET /api/v1/content
 *   → 200 { en: { hero_headline: '...', ... }, ar: { ... }, version: "ISO" }
 *
 * This client fetches the entire envelope in one round-trip, caches it
 * (reference tier via cacheMiddleware), and provides a `mergeWithFallback`
 * helper that overlays the backend values on top of FALLBACK_CONTENT.
 *
 * Design goals (per user spec):
 *   - One endpoint, one JSON envelope — efficient, easy to debug.
 *   - Frontend does its own caching. No per-key endpoints.
 *   - Fully pluggable: admin adds group/entry in admin panel, frontend
 *     picks it up on next fetch.
 */

import { FALLBACK_CONTENT, type FallbackContentKey } from './fallback-content';
import { icareApi } from './api-client';
import { resolveMediaUrl } from './media-url';

/**
 * Shape of the envelope returned by GET /api/v1/content.
 * Each locale key maps to a flat string map (key → value).
 */
export interface ContentEnvelope {
  en: Record<string, string>;
  ar: Record<string, string>;
  version: string;
}

/**
 * Content keys that hold image URLs. Derived from FALLBACK_CONTENT at module
 * load: any key whose fallback value looks like a URL (http(s)://, or a
 * /uploads/... proxied path) is treated as an image key.
 *
 * Why this matters: product image URLs are resolved + cache-busted ONCE at
 * fetch/map time (see `mappers.ts:normalizeProductMediaUrl`) so the cached
 * `Product` carries a stable, fetchable, versioned URL from the first
 * render. Content images historically did NOT get this treatment — they
 * flowed raw through the cache and were only resolved at render time inside
 * `ImageWithFallback`, where a late `contentVersion` arrival mutated the
 * `<img src>` mid-flight and tripped spurious `onError`. Resolving + busting
 * here gives the content path structural parity with the product path: the
 * cache, the React context, and the rendered `<img>` all carry one URL.
 */
const IMAGE_CONTENT_KEYS: ReadonlySet<string> = new Set(
  Object.entries(FALLBACK_CONTENT)
    .filter(([, value]) => typeof value === 'string' && /^https?:\/\//.test(value))
    .map(([key]) => key),
);

const isImageContentKey = (key: string): boolean => IMAGE_CONTENT_KEYS.has(key);

/**
 * Resolve an image-bearing content value to a fetchable URL and append the
 * envelope `version` as a cache-busting query param. Idempotent on absolute
 * URLs (resolveMediaUrl returns them unchanged) and skipped for empty
 * values. The cache-buster defeats the browser HTTP cache when an admin
 * uploads a replacement image under the same URL.
 *
 * Mirrors the contract in `ImageWithFallback.applyCacheBuster` but applied
 * once at the data layer instead of on every render, so the `<img src>`
 * never mutates after mount.
 */
const resolveContentImage = (value: string | null | undefined, version: string): string => {
  const resolved = resolveMediaUrl(value);
  if (!resolved) return '';
  // Only absolute http(s) URLs are cache-busted. Root-relative proxied
  // paths (/uploads/..., /api/icare/...) and Next.js /public assets are
  // served by rewrites that strip query strings, so appending ?v= would
  // 404 them. This matches the renderer's existing carve-out.
  if (!version || !/^https?:\/\//.test(resolved)) return resolved;
  const sep = resolved.includes('?') ? '&' : '?';
  return `${resolved}${sep}v=${encodeURIComponent(version)}`;
};

/**
 * Fetch all dynamic content from the backend in a single call.
 *
 * The endpoint returns every active entry in the system, grouped by
 * locale. No query parameters — the whole catalog is returned.
 *
 * Image-bearing keys are resolved + cache-busted here (data-layer parity
 * with the product mapper) so consumers receive stable, fetchable URLs.
 *
 * @param signal Optional AbortSignal for cancellation (e.g. unmount).
 * @returns The content envelope, or throws on network failure.
 */
export async function fetchAllContent(signal?: AbortSignal): Promise<ContentEnvelope> {
  // Use the same request()/parseEnvelope path as every other icareApi call:
  // buildUrl() applies the proxy base, parseEnvelope() unwraps {success,data},
  // and the auth/network error handling is identical to settings/products/etc.
  const payload = await icareApi.content.all(signal);

  // version: prefer the backend-provided value. When absent, use a stable
  // empty string rather than `new Date().toISOString()` — a per-fetch
  // timestamp would make every cache entry disagree with every other and
  // silently desync the cache from React's `contentVersion` state. Empty
  // means "no cache-busting", which is correct: with no version signal we
  // have no reason to defeat the browser cache.
  const version = (payload && typeof payload.version === 'string' && payload.version) || '';

  const resolveLocale = (slice: Record<string, string> | null | undefined): Record<string, string> => {
    if (!slice || typeof slice !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(slice)) {
      if (typeof value !== 'string') continue;
      out[key] = isImageContentKey(key) ? resolveContentImage(value, version) : value;
    }
    return out;
  };

  return {
    en: resolveLocale(payload && payload.en),
    ar: resolveLocale(payload && payload.ar),
    version,
  };
}

/**
 * Merge a locale slice from the envelope on top of FALLBACK_CONTENT.
 *
 * Pure function. Backend values win; fallback fills any key the backend
 * didn't return. Only keys present in FALLBACK_CONTENT are accepted
 * (unknown keys from the backend are ignored to keep the type safe).
 *
 * Image keys are expected to already be resolved + cache-busted by
 * `fetchAllContent` before reaching here; the fallback values (absolute
 * Unsplash URLs) are left as-is because they are static and need no
 * cache-busting.
 *
 * @param localeSlice The `en` or `ar` slice from ContentEnvelope.
 */
export function mergeWithFallback(
  localeSlice: Record<string, string> | null | undefined,
): Record<FallbackContentKey, string> {
  const merged: Record<string, string> = { ...FALLBACK_CONTENT };

  if (!localeSlice || typeof localeSlice !== 'object') {
    return merged as Record<FallbackContentKey, string>;
  }

  for (const [key, value] of Object.entries(localeSlice)) {
    // A backend key present with a string value (including '') overrides the
    // fallback — admins can clear a field by saving ''. Non-string/missing
    // values are ignored so the fallback still applies.
    if (typeof value === 'string' && key in merged) {
      merged[key] = value;
    }
  }

  return merged as Record<FallbackContentKey, string>;
}

/**
 * The full list of snake_case keys the storefront may request. Sourced
 * from Object.keys(FALLBACK_CONTENT). Keeps the FE in sync with the BE
 * registry by construction — any key added to FALLBACK_CONTENT is
 * automatically fetchable from the backend.
 */
export const ALL_CONTENT_KEYS: ReadonlyArray<FallbackContentKey> = Object.keys(
  FALLBACK_CONTENT,
) as FallbackContentKey[];
