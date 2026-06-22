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
 * Fetch all dynamic content from the backend in a single call.
 *
 * The endpoint returns every active entry in the system, grouped by
 * locale. No query parameters — the whole catalog is returned.
 *
 * @param signal Optional AbortSignal for cancellation (e.g. unmount).
 * @returns The content envelope, or throws on network failure.
 */
export async function fetchAllContent(signal?: AbortSignal): Promise<ContentEnvelope> {
  // Use the same request()/parseEnvelope path as every other icareApi call:
  // buildUrl() applies the proxy base, parseEnvelope() unwraps {success,data},
  // and the auth/network error handling is identical to settings/products/etc.
  const payload = await icareApi.content.all(signal);

  // Defensive: ensure envelope has the shape we expect.
  return {
    en: (payload && payload.en) || {},
    ar: (payload && payload.ar) || {},
    version: payload?.version ?? new Date().toISOString(),
  };
}

/**
 * Merge a locale slice from the envelope on top of FALLBACK_CONTENT.
 *
 * Pure function. Backend values win; fallback fills any key the backend
 * didn't return. Only keys present in FALLBACK_CONTENT are accepted
 * (unknown keys from the backend are ignored to keep the type safe).
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
