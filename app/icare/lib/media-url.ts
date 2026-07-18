/**
 * media-url.ts — canonical URL resolver.
 *
 * Single source of truth for normalizing media URLs to fetchable strings.
 * Handles absolute URLs (http/https), protocol-relative, data:image, blob,
 * proxied root-relative paths, and bare basenames. Rejects XSS-prone schemes
 * (javascript:, vbscript:, data: non-image) so they never reach the renderer.
 *
 * Other modules MUST call this instead of inlining their own normalization.
 *
 * Upload paths (/uploads/..., /public/uploads/...) are resolved to the
 * backend media origin so the browser loads them directly — no Next.js
 * rewrite proxy hop, no socket hangup. The origin is taken from
 * NEXT_PUBLIC_IMAGE_BASE_URL (public env var). When unset (local dev without
 * a remote backend), paths fall back to root-relative and the Next.js
 * rewrite in next.config.ts handles the proxying.
 */

const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '').replace(/\/$/, '');
const IMAGE_PROXY_BASE_URL = '/api/icare';
const BASE_PREFIX = IMAGE_BASE_URL || IMAGE_PROXY_BASE_URL;

// Upload prefixes that should resolve to the backend media origin directly.
const UPLOAD_PREFIXES: readonly string[] = [
  '/uploads/',
  '/public/uploads/',
];

const startsWithAny = (value: string, prefixes: readonly string[]): boolean => {
  for (const prefix of prefixes) {
    if (value.startsWith(prefix)) return true;
  }
  return false;
};

export function resolveMediaUrl(value: string | null | undefined): string {
  if (value == null) return '';
  const trimmed = String(value).trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();

  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) return '';
  if (lower.startsWith('data:') && !lower.startsWith('data:image/')) return '';

  if (lower.startsWith('https://') || lower.startsWith('http://')) return trimmed;
  if (lower.startsWith('//')) return trimmed;
  if (lower.startsWith('blob:')) return trimmed;
  if (lower.startsWith('data:image/')) return trimmed;

  if (trimmed.startsWith('/')) {
    // Upload paths → resolve to the backend media origin directly.
    // Browser loads from backend, no Next.js proxy hop, no socket hangup.
    if (startsWithAny(trimmed, UPLOAD_PREFIXES)) return trimmed;
    // Already-proxied paths (/api/icare/...) stay as-is.
    if (trimmed.startsWith('/api/icare/')) return trimmed;
    // Other root-relative paths → prefix with the base (backend or proxy).
    return `${BASE_PREFIX}${trimmed}`;
  }

  return `${BASE_PREFIX}/${trimmed}`;
}

export function resolveMany(
  values: ReadonlyArray<string | null | undefined> | null | undefined,
): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  for (const v of values) {
    const resolved = resolveMediaUrl(v);
    if (resolved) out.push(resolved);
  }
  return out;
}

export function resolveOrFallback(
  value: string | null | undefined,
  fallback?: string,
): string {
  const resolved = resolveMediaUrl(value);
  return resolved || (fallback ?? '');
}

export function resolveMediaUrlRaw(value: string | null | undefined): string {
  return resolveMediaUrl(value);
}

export function isSafeImageUrl(src: unknown): src is string {
  return typeof src === 'string' && src.length > 0 && resolveMediaUrl(src).length > 0;
}
