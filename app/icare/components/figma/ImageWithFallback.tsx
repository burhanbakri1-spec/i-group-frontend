'use client';

import React, { useState } from 'react';
import { resolveMediaUrl, isSafeImageUrl } from '../../lib/media-url';

interface ImageWithFallbackProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

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
 * - Accessible "no image" placeholder when src is missing or the load fails.
 * - `width`/`height` props are accepted for backwards compat but ignored
 *   — plain `<img>` infers dimensions from the container.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  style,
  priority = false,
}: ImageWithFallbackProps) {
  const [loaded, setLoaded] = useState(false);
  const [didError, setDidError] = useState(false);
  const resolved = isSafeImageUrl(src) ? resolveMediaUrl(src) : '';

  if (!resolved || didError) {
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

  return (
    <div className={`relative ${className ?? ''}`} style={style}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted motion-safe:animate-[skeleton-pulse_2.5s_ease-in-out_infinite] motion-reduce:opacity-50 rounded-[inherit]" />
      )}
      <img
        src={resolved}
        alt={alt ?? ''}
        className={`${className ?? ''} ${!loaded ? 'opacity-0' : 'opacity-100 skeleton-content'}`}
        style={style}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => {
          console.warn('[ImageWithFallback] failed to load:', { originalSrc: src, resolvedUrl: resolved });
          setDidError(true);
        }}
      />
    </div>
  );
}
