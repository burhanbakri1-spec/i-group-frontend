/**
 * content-client.ts — Bridge to BE ContentProvider.
 *
 * The backend exposes a CMS-style content registry via:
 *   GET /api/v1/content?keys=k1,k2,k3&lang=en
 *   → 200 { k1: {key,type,val,fallbackUsed,isActive}, k2: {...}, ... }
 *
 * Returns at most 50 keys per call (`content.controller.ts:40`).
 * This client batches larger key sets and merges results.
 *
 * The backend always returns a value for registered keys — either the
 * admin override or the shipped defaultValue. Missing keys are silently
 * dropped from the response. Callers should treat absent keys as
 * "use fallback" and supply their own fallback from fallback-content.ts.
 */

import { FALLBACK_CONTENT, type FallbackContentKey } from './fallback-content';

const BATCH_LIMIT = 50;

export interface ResolvedContentValue {
  key: string;
  type: 'text' | 'image';
  val: string;
  fallbackUsed: boolean;
  isActive: boolean;
}

export type ContentBatchResponse = Record<string, ResolvedContentValue>;

interface ContentBatchEnvelope {
  success: boolean;
  data: ContentBatchResponse | null;
  message?: string;
}

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ICARE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  return '/api/icare';
};

/**
 * Fetch a batch of content keys. Sends parallel requests when keys > BATCH_LIMIT.
 * Returns a map keyed by BE dotted key. Missing keys are absent from the map.
 *
 * Memoizes a single 404 outcome per session: once the BE confirms the
 * `/api/v1/content` endpoint doesn't exist (or any other hard failure), we
 * stop hitting the network for it. Content state is pre-populated with
 * FALLBACK_CONTENT in ShopContext, so a skipped call is invisible to the UI.
 */
let endpointUnavailable = false;
let endpointWarned = false;

export async function fetchContentBatch(
  keys: ReadonlyArray<string>,
  lang: 'en' | 'ar' = 'en',
  signal?: AbortSignal,
): Promise<ContentBatchResponse> {
  if (keys.length === 0) return {};
  if (endpointUnavailable) return {};
  const baseUrl = getApiBaseUrl();

  const batches: string[][] = [];
  for (let i = 0; i < keys.length; i += BATCH_LIMIT) {
    batches.push(keys.slice(i, i + BATCH_LIMIT));
  }

  const responses = await Promise.all(batches.map(async (batch) => {
    const url = `${baseUrl}/api/v1/content?keys=${encodeURIComponent(batch.join(','))}&lang=${lang}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal,
      });
    } catch {
      // Network failure — fall back to defaults already in state.
      return {};
    }
    if (!response.ok) {
      // Content state is pre-populated with FALLBACK_CONTENT in ShopContext.
      // A failed batch just means fallbacks stay. Don't throw — that
      // would surface an unhandled error to the UI for what is a
      // graceful-degradation path. Remember the failure so we stop
      // re-hitting an endpoint that doesn't exist.
      endpointUnavailable = true;
      if (!endpointWarned && process.env.NODE_ENV !== 'production') {
        endpointWarned = true;
        // eslint-disable-next-line no-console
        console.warn(`[content-client] BE content endpoint unavailable (HTTP ${response.status}); using shipped fallbacks.`);
      }
      return {};
    }
    try {
      const body = (await response.json()) as ContentBatchEnvelope;
      if (!body.success || !body.data) {
        return {};
      }
      return body.data;
    } catch {
      return {};
    }
  }));

  return responses.reduce<ContentBatchResponse>((merged, batch) => {
    Object.assign(merged, batch);
    return merged;
  }, {});
}

/**
 * Build a complete content map by merging fallback content with a batch
 * response. Backend values win; fallback fills any key the BE didn't return.
 *
 * Pure / sync / cheap — safe to call inside `useMemo`.
 */
export function mergeWithFallback(
  batch: ContentBatchResponse,
  lang: 'en' | 'ar' = 'en',
): Record<FallbackContentKey, string> {
  const merged: Record<string, string> = { ...FALLBACK_CONTENT };
  for (const [key, resolved] of Object.entries(batch)) {
    if (resolved && typeof resolved.val === 'string' && resolved.val.length > 0) {
      merged[key] = resolved.val;
    }
  }
  // `lang` is passed for future per-locale overrides; the batch endpoint
  // already selects the locale server-side and returns the resolved string.
  void lang;
  return merged as Record<FallbackContentKey, string>;
}

/**
 * The full list of dotted keys the storefront may request. Sourced from
 * `Object.keys(FALLBACK_CONTENT)`. Keeps the FE in sync with the BE
 * registry by construction.
 */
export const ALL_CONTENT_KEYS: ReadonlyArray<FallbackContentKey> = Object.keys(FALLBACK_CONTENT) as FallbackContentKey[];
