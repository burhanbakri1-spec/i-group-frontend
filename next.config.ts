import type { NextConfig } from "next";

/**
 * Media URL architecture
 * ======================
 *
 * The canonical resolver `app/icare/lib/media-url.ts#resolveMediaUrl` is the
 * single source of truth for normalizing media URLs. It handles four cases:
 *
 *   1. Absolute URLs (http/https) and protocol-relative (`//`) → returned as-is.
 *   2. Blob/data:image → returned as-is (renderer-safe).
 *   3. Root-relative paths (`/uploads/...`, `/public/uploads/...`,
 *      `/api/icare/...`) → returned as-is, then served by one of the rewrites
 *      below or the proxy route at `app/api/icare/[...path]/route.ts`.
 *   4. Bare basenames (e.g. `products/x.png`) and other root-relative paths
 *      → prefixed with the proxy base (`/api/icare/`) and forwarded by the
 *      proxy route.
 *
 * Two layers serve the resulting URLs:
 *
 *   A. Rewrites below — defence-in-depth for the two well-known upload
 *      prefixes that backend code may return verbatim (`/uploads/`,
 *      `/public/uploads/`). Any FE consumer that forgets to call
 *      `resolveMediaUrl()` still gets a working image because the browser's
 *      request is transparently proxied to the backend.
 *
 *   B. Proxy route at `app/api/icare/[...path]/route.ts` — handles arbitrary
 *      backend paths that the resolver prefixes with `/api/icare/`. This is
 *      the general-purpose path for bare basenames and unknown prefixes.
 *
 * We intentionally do NOT add a broad rewrite here (e.g. a catch-all that
 * forwards any root-relative path to the backend origin). Two reasons:
 *
 *   1. The proxy route already covers arbitrary paths. A rewrite that
 *      overlaps with `/api/icare/*` would risk a re-rewrite loop inside
 *      Next.js's rewrite engine.
 *   2. Keeping the rewrite list narrow makes the routing table auditable —
 *      each entry is a deliberate allow-list of backend-known prefixes.
 *
 * If a new backend prefix emerges that needs serve-from-origin support, add
 * a dedicated rewrite rule here. Do not broaden the pattern.
 *
 * Order matters: `rewrites()` runs before page rendering, so an `<img
 * src="/public/uploads/x.png">` URL hits the rewrite and lands on the
 * backend. Without this, the Next.js origin would 404 for every upload.
 *
 * The destination uses the current platform API URL and falls back to the
 * reviewed staging API if unset. The same env var is consumed by the
 * Next.js API proxy at `app/api/icare/[...path]/route.ts`.
 */
const BACKEND_MEDIA_ORIGIN = (
  process.env.PLATFORM_API_BASE_URL
  ?? process.env.ICARE_API_BASE_URL
  ?? 'http://cg8hv00dppir2hu99ds4p75h.187.55.225.56.sslip.io'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'backend.igroup.website' },
    ],
  },
  async rewrites() {
    return [
      // Hostinger mode: backend stores uploads under public_html/uploads/
      // and serves them at /uploads/ via Apache (not via NestJS).
      { source: '/uploads/:path*', destination: `${BACKEND_MEDIA_ORIGIN}/uploads/:path*` },
      // NestJS dev/cross-origin mode: @fastify/static mounts at /public/.
      // Admin uploads return /public/uploads/<uuid>.<ext>; the FE origin
      // can't serve them, so proxy to the backend.
      { source: '/public/uploads/:path*', destination: `${BACKEND_MEDIA_ORIGIN}/public/uploads/:path*` },
    ];
  },
  // UX safeguard: iGroup landing is at `/`, iCare storefront is at `/icare/*`.
  // Users (and pasted links) frequently drop the `/icare` prefix. Forward
  // bare storefront paths to their canonical `/icare/*` location with a 308
  // (permanent) so the browser bar reflects the final URL.
  async redirects() {
    const storefrontPaths = [
      'shop',
      'cart',
      'checkout',
      'account',
      'wishlist',
      'story',
      'contact',
      'faq',
      'vlog',
      'find-us',
      'shipping',
      'privacy',
      'terms',
      'track-order',
      'accessibility',
    ];
    return storefrontPaths.map((path) => ({
      source: `/${path}`,
      destination: `/icare/${path}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
