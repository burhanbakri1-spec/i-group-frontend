import { AllSettingsResponse, ApiEnvelope, AppSettings } from '../types';
import { normalizeSettingsGroups } from './settings';

const APPROVED_BACKEND_FALLBACK_URL = 'https://backend.igroup.website';
const SETTINGS_PATH = '/api/v1/settings';

const getServerApiBaseUrl = () => (
  process.env.ICARE_API_BASE_URL || APPROVED_BACKEND_FALLBACK_URL
).replace(/\/$/, '');

const parseSettingsEnvelope = async (response: Response): Promise<AllSettingsResponse | null> => {
  if (!response.ok) return null;

  const body = await response.text();
  if (!body) return null;

  const parsed = JSON.parse(body) as ApiEnvelope<AllSettingsResponse> | AllSettingsResponse;
  if ('data' in parsed && parsed.data) return parsed.data;
  return parsed as AllSettingsResponse;
};

// Hard ceiling on how long we'll wait for the settings endpoint during
// static prerender. The prerender pool gets killed by the hosting platform
// at 60s — if `fetchServerSettings` blocks past that, the route fails with
// "took more than 60 seconds" and the whole `next build` aborts.
//
// Production saw 35–60s 503s during the 2026-06-20 deploy window, so we
// also fail-fast (2s) during `next build` itself: the prerender only needs
// settings for `generateMetadata` and the component layer already falls back
// to hard-coded defaults when this returns null.
const SETTINGS_FETCH_TIMEOUT_MS =
  process.env.NEXT_PHASE === 'phase-production-build' ? 2000 : 8000;

// Module-level in-flight memo: every `/icare/*` page's `generateMetadata`
// calls `fetchServerSettings` during static prerender. Without dedup, each
// of the 40 prerender workers fires its own HTTP request, and even with
// `next: { revalidate: 300 }` the cache is per-fetch-scope, not per-worker.
// Sharing a single in-process promise caps the work to one network round
// trip per worker regardless of how many routes render in parallel.
let inflight: Promise<AppSettings | null> | null = null;

export const fetchServerSettings = async (): Promise<AppSettings | null> => {
  if (inflight) return inflight;
  inflight = doFetchServerSettings();
  return inflight;
};

async function doFetchServerSettings(): Promise<AppSettings | null> {
  const t0 = Date.now();
  const url = `${getServerApiBaseUrl()}${SETTINGS_PATH}`;
  const controller = new AbortController();
  // Arm through the FULL fetch (headers + body). `await fetch()` resolves
  // once headers arrive; clearing the timer there lets a backend that sends
  // headers fast but stalls on the body (the 35–60s 503 profile seen
  // 2026-06-20) keep `response.text()` blocked past the 60s prerender kill.
  // The AbortSignal stays attached to the body stream, so a late abort
  // cancels the in-flight `text()` read and we fall back to null.
  const timer = setTimeout(() => controller.abort(), SETTINGS_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    const data = await parseSettingsEnvelope(response);
    const norm = normalizeSettingsGroups(data);
    if (process.env.ICARE_DEBUG_SETTINGS) {
      console.log(
        `[fetchServerSettings] url=${url} ok=${response.ok} status=${response.status} total=${Date.now() - t0}ms`,
      );
    }
    return norm;
  } catch (e) {
    if (process.env.ICARE_DEBUG_SETTINGS) {
      console.log(`[fetchServerSettings] FAILED after ${Date.now() - t0}ms: ${e.name}: ${e.message}`);
    }
    return null;
  } finally {
    clearTimeout(timer);
    // Allow a later request after the build finishes (e.g. dev server
    // hot-reload) to re-fetch, but keep dedup within the same prerender
    // burst — long enough for the 40-worker pool to settle.
    setTimeout(() => { inflight = null; }, 1000).unref?.();
  }
}
