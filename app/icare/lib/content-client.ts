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
import { resolveMediaUrl } from './media-url';

export interface ContentEnvelope {
  en: Record<string, string>;
  ar: Record<string, string>;
  version: string;
}

/**
 * Resolve every string value in a locale slice through resolveMediaUrl.
 * Mirrors mapBackendProductToProduct: URLs are normalized once at map time,
 * never touched again downstream. Non-URL strings pass through unchanged
 * because resolveMediaUrl returns them as-is when they don't look like paths.
 */
const resolveLocaleValues = (
  slice: Record<string, string> | null | undefined,
): Record<string, string> => {
  if (!slice || typeof slice !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(slice)) {
    if (typeof value !== 'string') continue;
    out[key] = resolveMediaUrl(value);
  }
  return out;
};

/**
 * Fetch all dynamic content from the backend in a single call.
 * Resolves all string values (image URLs included) at map time — same
 * contract as mapBackendProductToProduct. No retry, no cache-busting,
 * no version threading.
 *
 * @param signal Optional AbortSignal for cancellation on unmount.
 * @returns ContentEnvelope (throws on network/HTTP failure, like icareApi).
 */
export async function fetchAllContent(signal?: AbortSignal): Promise<ContentEnvelope> {
  const payload = await icareApi.content.all(signal);
  const version = (payload && typeof payload.version === 'string' && payload.version) || '';

  return {
    en: resolveLocaleValues(payload && payload.en),
    ar: resolveLocaleValues(payload && payload.ar),
    version,
  };
}

/**
 * Merge a locale slice from the envelope on top of FALLBACK_CONTENT.
 *
 * Pure function. Backend values win; fallback fills any key the backend
 * didn't return. Only keys present in FALLBACK_CONTENT are accepted.
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
    if (typeof value === 'string' && key in merged) {
      merged[key] = value;
    }
  }

  return merged as Record<FallbackContentKey, string>;
}

export const ALL_CONTENT_KEYS: ReadonlyArray<FallbackContentKey> = Object.keys(
  FALLBACK_CONTENT,
) as FallbackContentKey[];