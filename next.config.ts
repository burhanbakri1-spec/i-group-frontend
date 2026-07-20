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
 * The backend origin comes from the centralized platform-origin utility
 * (env-var-driven) so there is no hardcoded production or staging URL here.
 */
const BACKEND_MEDIA_ORIGIN = (() => {
  const origin =
    process.env.PLATFORM_API_BASE_URL
    ?? process.env.ICARE_API_BASE_URL
    ?? 'http://localhost:54321';
  return origin.replace(/\/$/, '');
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'backend.igroup.website' },
      { protocol: 'https', hostname: 'api-staging.igroup.website' },
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
