import type { NextConfig } from "next";

/**
 * Backend media lives under `/public/uploads/<filename>` and is served by the
 * NestJS app (via @fastify/static with prefix '/public/'). The storefront
 * rewrites any request to that path on its own origin over to the configured
 * backend host. This is the "defence in depth" path: any FE consumer that
 * forgets to call `resolveMediaUrl()` still gets a working image because the
 * browser's request is transparently proxied to the backend.
 *
 * Order matters: `rewrites()` runs before page rendering, so the
 * `<img src="/public/uploads/x.png">` URL hits the rewrite and lands on the
 * backend. Without this, the Next.js origin would 404 for every upload.
 *
 * The destination uses `ICARE_API_BASE_URL` (server-only) and falls back to
 * the production backend if unset. The same env var is consumed by the
 * Next.js API proxy at `app/api/icare/[...path]/route.ts`.
 */
const BACKEND_MEDIA_ORIGIN = (
  process.env.ICARE_API_BASE_URL ?? 'https://backend.igroup.website'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'backend.igroup.website' },
      // OSM raster tiles for the store-locator map. Wildcards match the
      // `a.tile`, `b.tile`, `c.tile` subdomains used for load balancing.
      // The map currently uses plain `<img>` (react-leaflet TileLayer)
      // and so does NOT actually hit the next/image optimizer today,
      // but the wildcard is added defensively in case any future
      // consumer routes tile URLs through next/image.
      { protocol: 'https', hostname: '*.tile.openstreetmap.org' },
    ],
  },
  async rewrites() {
    return [
      // Hostinger mode: backend stores uploads under public_html/uploads/
      // and serves them at /uploads/ via Apache (not via NestJS).
      { source: '/uploads/:path*', destination: `${BACKEND_MEDIA_ORIGIN}/uploads/:path*` },
      // NestJS @fastify/static serves admin uploads at /public/uploads/.
      // Mirrors the /uploads/ rule for the canonical admin upload prefix
      // so FE consumers that emit /public/uploads/x.png (resolveMediaUrl)
      // resolve server-side without hitting the Next.js origin 404.
      { source: '/public/uploads/:path*', destination: `${BACKEND_MEDIA_ORIGIN}/public/uploads/:path*` },
    ];
  },
};

export default nextConfig;
