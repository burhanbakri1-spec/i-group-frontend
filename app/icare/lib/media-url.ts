/**
 * media-url.ts — single resolution point for backend-supplied image URLs.
 *
 * The protocol
 * ────────────
 *   1. The backend (e-commerce-backend) stores images in two URL shapes:
 *        a. Canonical relative: `/public/uploads/<filename>`
 *        b. External absolute:  `https://cdn.example.com/x.png` (or `data:`)
 *      Anything else is legacy (`/uploads/...`, bare basename) and is
 *      tolerated by the GC sweep + write-path normaliser, but the
 *      *expected* shape going forward is (a) or (b).
 *
 *   2. The browser needs an absolute URL to render `<img src>`. This
 *      helper prepends `NEXT_PUBLIC_IMAGE_BASE_URL` to relative paths
 *      and leaves external URLs untouched.
 *
 *   3. As defence in depth, the Next.js config has a rewrite that maps
 *      `/public/uploads/:path*` on the storefront origin to the backend
 *      origin, so even a consumer that forgets this helper still renders
 *      uploaded images correctly (it just adds one extra hop).
 *
 * Usage
 * ─────
 *   // Hero image, philosophy image, etc. coming from Setting.value
 *   const hero = resolveMediaUrl(settingRow.value, FALLBACK_HERO);
 *
 *   // Product images
 *   const card = resolveMediaUrl(product.primaryImage);
 *
 *   // Arrays of URLs (settings, gallery, etc.)
 *   const gallery = resolveMany(product.images);
 *
 *   // Never-empty form (returns fallback if both input and base are empty)
 *   const cover = resolveOrFallback(unit.image, '/placeholder.jpg');
 */

const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '').replace(/\/$/, '');

/**
 * Fallback used when the Next.js proxy is the only available host
 * (no `NEXT_PUBLIC_IMAGE_BASE_URL` env). Kept as a relative path so
 * it works on any deployment target.
 */
const IMAGE_PROXY_BASE_URL = '/api/icare';

const MEDIA_BASE = IMAGE_BASE_URL || IMAGE_PROXY_BASE_URL;

/**
 * True for any URL that the browser can fetch directly without
 * prepending a base. Mirrors the list in
 * `components/figma/ImageWithFallback.tsx#isNativeImageSource` — they
 * MUST stay in sync.
 */
const isExternal = (value: string): boolean =>
  /^(https?:|data:|blob:|\/\/)/i.test(value);

/**
 * Prepend the configured media base to a relative path.
 * Idempotent on already-prefixed relative paths (no double prefix).
 * Returns the basename unchanged when MEDIA_BASE is empty and the path
 * is already absolute-ish.
 */
const prefixRelative = (value: string): string => {
  if (value.startsWith('/')) return `${MEDIA_BASE}${value}`;
  return `${MEDIA_BASE}/${value}`;
};

/**
 * Resolve a single backend-supplied URL to one the browser can fetch.
 *
 * Behaviour matrix:
 *   null / undefined / ''      → fallback ?? ''
 *   '  '                      → fallback ?? ''
 *   'https://cdn.example/x.png' → unchanged
 *   'data:image/png;base64,...' → unchanged
 *   '//cdn.example/x.png'     → unchanged (protocol-relative)
 *   '/public/uploads/x.png'   → '<MEDIA_BASE>/public/uploads/x.png'
 *   '/uploads/x.png'          → '<MEDIA_BASE>/uploads/x.png'  (legacy)
 *   'x.png'                   → '<MEDIA_BASE>/x.png'  (bare basename)
 *   '/api/icare/...'          → unchanged (already an FE proxy path)
 */
export function resolveMediaUrl(
  value: string | null | undefined,
  fallback?: string,
): string {
  if (value == null) return fallback ?? '';
  const trimmed = String(value).trim();
  if (trimmed === '') return fallback ?? '';
  if (isExternal(trimmed)) return trimmed;
  // Already an FE proxy path — no need to prepend.
  if (trimmed.startsWith('/api/icare/')) return trimmed;
  return prefixRelative(trimmed);
}

/**
 * Resolve an array of URLs. Drops entries that resolve to empty
 * (so consumers can spread the result without `<img src="">`).
 */
export function resolveMany(values: ReadonlyArray<string | null | undefined> | null | undefined): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  for (const v of values) {
    const resolved = resolveMediaUrl(v);
    if (resolved) out.push(resolved);
  }
  return out;
}

/**
 * Like `resolveMediaUrl` but guarantees a non-empty return value.
 * `placeholder` is the last-resort fallback when the input is empty
 * AND no `fallback` is provided.
 */
export function resolveOrFallback(
  value: string | null | undefined,
  fallback?: string,
  placeholder = '',
): string {
  const resolved = resolveMediaUrl(value, fallback);
  if (resolved) return resolved;
  return placeholder;
}

/**
 * Escape hatch for code paths that need the URL untouched (e.g.
 * next/image with a known absolute host, or a <video src>). Trims
 * whitespace but does not prepend the base.
 */
export function resolveMediaUrlRaw(value: string | null | undefined): string {
  if (value == null) return '';
  return String(value).trim();
}

export { IMAGE_BASE_URL, IMAGE_PROXY_BASE_URL, MEDIA_BASE };
