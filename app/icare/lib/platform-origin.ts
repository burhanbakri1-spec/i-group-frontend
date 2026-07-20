/**
 * platform-origin.ts — single source of truth for the backend API origin.
 *
 * Priority (highest first):
 *   1. PLATFORM_API_BASE_URL env var (server-only)
 *   2. ICARE_API_BASE_URL env var (server-only, backward compat)
 *   3. localhost fallback (local dev only)
 *
 * No production or staging URLs are hardcoded here — they must be supplied
 * via environment variables at build/deploy time.
 */

const LOCAL_FALLBACK = 'http://localhost:54321';

export function platformApiOrigin(): string {
  return (
    process.env.PLATFORM_API_BASE_URL
    ?? process.env.ICARE_API_BASE_URL
    ?? LOCAL_FALLBACK
  ).replace(/\/$/, '');
}

export function storefrontHost(): string {
  return process.env.NEXT_PUBLIC_STOREFRONT_HOST?.trim() || 'igroup.website';
}
