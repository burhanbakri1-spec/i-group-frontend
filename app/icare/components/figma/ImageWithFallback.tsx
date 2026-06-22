'use client';

import React, { useState } from 'react';
import { resolveMediaUrl, isSafeImageUrl } from '../../lib/media-url';
import { useShop } from '../../context/ShopContext';

interface ImageWithFallbackProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  fallbackAlt?: string;
}

/**
 * `fallbackSrc` paths that already point at Next.js /public/ assets must
 * bypass the canonical resolver — otherwise they'd be prepended with
 * `/api/icare` (the BE proxy base) and 404. Brand placeholder assets in
 * /public/default-*.svg match this carve-out; any other fallbackSrc still
 * flows through the resolver.
 */
const isPublicAssetPath = (path: string): boolean =>
  path.startsWith('/default-');

/**
 * ImageWithFallback — URL-shape-agnostic image renderer.
 *
 * Resolves `src` through the canonical resolver, which guarantees the
 * result is either empty (rejected input), absolute (http/https), a
 * protocol-relative URL, a data:image URL, a blob: URL, or a root-
 * relative path that Next.js proxies via rewrites. For all of these a
 * plain `<img>` works — we never need the next/image optimizer.
 *
 * - Skeleton overlay + opacity transition until the image decodes.
 * - `loading="lazy"` by default; `eager` when `priority` is set.
 * - `decoding="async"` keeps the main thread responsive.
 * - `onError` logs a warning (was previously silent — operational blind spot).
 * - Missing src OR load failure → renders the `fallbackSrc` as a real
 *   `<img>` (default `/default-product.svg`). The fallback loads eagerly
 *   so it appears as a safety net without flash. If the fallback itself
 *   fails, we drop to the legacy text "no image" placeholder (final
 *   defense-in-depth). No recursion: when the fallback image errors we
 *   stop — there is nothing left to try.
 * - `fallbackAlt` defaults to `alt` (or `Image unavailable` when neither
 *   is set) — the fallback is meaningful content, not decorative noise.
 * - `width`/`height` props are accepted for backwards compat but ignored
 *   — plain `<img>` infers dimensions from the container.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  style,
  priority = false,
  fallbackSrc = '/default-product.svg',
  fallbackAlt,
}: ImageWithFallbackProps) {
  const [loaded, setLoaded] = useState(false);
  const [didError, setDidError] = useState(false);
  // contentVersion is the BE envelope timestamp. Appending it as a query
  // string forces the browser to bypass its HTTP cache when the admin
  // uploads a replacement image (same URL, different bytes).
  const { contentVersion } = useShop();
  const resolved = isSafeImageUrl(src) ? resolveMediaUrl(src) : '';
  const fallbackResolved = fallbackSrc && isPublicAssetPath(fallbackSrc)
    ? fallbackSrc
    : resolveMediaUrl(fallbackSrc);

  // Append a cache-busting query param to http(s) URLs only. Root-relative
  // proxied paths (/api/icare/..., /uploads/...) and the Next.js
  // /default-*.svg fallbacks don't need it (and adding ?v= would break
  // the rewrite rules that strip the prefix).
  const applyCacheBuster = (url: string): string => {
    if (!contentVersion || !url) return url;
    if (!/^https?:\/\//.test(url)) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}v=${encodeURIComponent(contentVersion)}`;
  };

  const shouldShowFallback = !resolved || didError;

  if (shouldShowFallback && !fallbackResolved) {
    return (
      <div
        className={`inline-flex bg-muted text-center align-middle ${className ?? ''}`}
        style={style}
        role="img"
        aria-label={alt ?? 'Image unavailable'}
      >
        <div className="flex items-center justify-center w-full h-full px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30">
          no image
        </div>
      </div>
    );
  }

  const imageSrc = applyCacheBuster(shouldShowFallback ? fallbackResolved : resolved);

  return (
    <div className={`relative ${className ?? ''}`} style={style}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted motion-safe:animate-[skeleton-pulse_2.5s_ease-in-out_infinite] motion-reduce:opacity-50 rounded-[inherit]" />
      )}
      <img
        src={imageSrc}
        alt={shouldShowFallback ? (fallbackAlt ?? alt ?? '') : (alt ?? '')}
        className={`${className ?? ''} ${!loaded ? 'opacity-0' : 'opacity-100 skeleton-content'}`}
        style={style}
        loading={priority || shouldShowFallback ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!shouldShowFallback) {
            console.warn('[ImageWithFallback] failed to load:', { originalSrc: src, resolvedUrl: resolved });
            setDidError(true);
          }
        }}
      />
    </div>
  );
}