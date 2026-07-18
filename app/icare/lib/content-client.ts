/**
 * content-client.ts — Bridge to the dynamic content system.
 *
 * Single endpoint: GET /api/v1/content → ContentEnvelope.
 *
 * Image handling is IDENTICAL to the catalog path (mappers.ts):
 *   - resolveMediaUrl() applied once at map time.
 *   - No cache-busting, no version tracking, no key-type detection.
 *   - The cached envelope and the rendered <img> carry one stable URL.
 */

import { FALLBACK_CONTENT, type FallbackContentKey } from './fallback-content';
import { icareApi } from './api-client';
export interface ContentEnvelope {
  en: Record<string, string>;
  ar: Record<string, string>;
  version: string;
}

/**
 * Fetch all dynamic content from the backend in a single call.
 * Locale slices pass through verbatim — image URLs are already absolute
 * and text fields must not be rewritten. No retry, no cache-busting,
 * no version threading.
 *
 * @param signal Optional AbortSignal for cancellation on unmount.
 * @returns ContentEnvelope (throws on network/HTTP failure, like icareApi).
 */
export async function fetchAllContent(signal?: AbortSignal): Promise<ContentEnvelope> {
  const payload = await icareApi.content.all(signal);
  const version = (payload && typeof payload.version === 'string' && payload.version) || '';

  return {
    en: payload && payload.en && typeof payload.en === 'object' ? payload.en : {},
    ar: payload && payload.ar && typeof payload.ar === 'object' ? payload.ar : {},
    version,
  };
}

/**
 * Merge a locale slice from the envelope on top of FALLBACK_CONTENT.
 *
 * Pure function. Backend values win; fallback fills any key the backend
 * didn't return. Only keys present in FALLBACK_CONTENT are accepted.
 *
 * Defensive: the BE may return text fields as either a plain string or a
 * localized object `{ en, ar }`. We coerce both to a string before merging
 * — strings pass through, objects are flattened by `coerceToString` (which
 * prefers the active locale and falls back to `en`).
 *
 * @param localeSlice The `en` or `ar` slice from ContentEnvelope.
 */
export function mergeWithFallback(
  localeSlice: Record<string, string> | null | undefined,
  activeLocale: 'en' | 'ar' = 'en',
): Record<FallbackContentKey, string> {
  const merged: Record<string, string> = Object.fromEntries(
    Object.keys(FALLBACK_CONTENT).map((key) => [key, '']),
  );

  if (!localeSlice || typeof localeSlice !== 'object') {
    return merged as Record<FallbackContentKey, string>;
  }

  for (const [key, value] of Object.entries(localeSlice)) {
    if (key in merged) {
      const coerced = coerceToString(value, activeLocale);
      if (coerced !== null) {
        merged[key] = coerced;
      }
    }
  }

  return merged as Record<FallbackContentKey, string>;
}

/**
 * Coerce a content value to a plain string.
 *
 * The BE sometimes returns `{ en, ar }` even for content text fields. We
 * pick the right locale (active → en fallback) and return a string, or
 * `null` if the value is unusable. Defensive — never throws.
 */
function coerceToString(value: unknown, activeLocale: 'en' | 'ar'): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const fromActive = obj[activeLocale];
    if (typeof fromActive === 'string' && fromActive.trim() !== '') return fromActive;
    const fromEn = obj.en;
    if (typeof fromEn === 'string' && fromEn.trim() !== '') return fromEn;
    const fromAr = obj.ar;
    if (typeof fromAr === 'string' && fromAr.trim() !== '') return fromAr;
  }
  return null;
}

export const ALL_CONTENT_KEYS: ReadonlyArray<FallbackContentKey> = Object.keys(
  FALLBACK_CONTENT,
) as FallbackContentKey[];
