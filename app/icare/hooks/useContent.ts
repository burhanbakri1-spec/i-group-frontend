'use client';

import { useEffect, useState } from 'react';
import { fetchContent, ContentLocale, ResolvedContent } from '../lib/content-client';
import { resolveMediaUrl } from '../lib/media-url';
import type { ContentKeys } from '../lib/content-keys';

export interface UseContentOptions {
  lang?: ContentLocale;
  fallback?: string;
}

export interface UseContentResult {
  val: string;
  isLoading: boolean;
  error: Error | null;
  fallbackUsed: boolean;
  isActive: boolean;
}

// Image-typed keys are stored as raw backend URLs (e.g. `/public/uploads/x.png`
// for admin uploads, `https://images.unsplash.com/...` for hardcoded defaults).
// The browser needs an absolute URL to fetch — the BE admin upload path is
// relative to the BE origin, not the storefront origin, so callers MUST
// receive a media-resolved URL. We auto-resolve here (rather than requiring
// every caller to wrap with `resolveMediaUrl`) so that:
//   1. Admin uploads via the admin UI render correctly on the storefront
//      (the headline ContentProvider use case: "admin edits → FE reflects").
//   2. There's no drift between direct useContent callers (which would
//      forget the wrapper) and useSiteContent (which applies it).
// The `.image`/`.mobile`/`.tablet`/`.video` suffix set matches every
// image-typed key in `lib/content-keys.d.ts` (image type, not text).
// `home.social.image1..4` use a `.image\d+` numeric suffix, covered by the
// regex branch so admin uploads for those slots resolve to absolute URLs.
const isImageKey = (key: string): boolean =>
  key.endsWith('.image') ||
  key.endsWith('.mobile') ||
  key.endsWith('.tablet') ||
  key.endsWith('.video') ||
  key.endsWith('.logo.image') ||
  /^.*\.image\d+$/.test(key);

// Type-safe overload — caller gets autocomplete on the ContentKeys type.
export function useContent<K extends keyof ContentKeys>(
  key: K,
  opts?: UseContentOptions,
): UseContentResult;

// Untyped escape hatch — used by the useSiteContent shim where the key list
// spans more fields than the auto-generated ContentKeys type covers (the
// shim is the migration bridge; a missing key falls back to the literal
// passed in `opts.fallback`).
export function useContent(
  key: string,
  opts?: UseContentOptions,
): UseContentResult;

export function useContent(
  key: string,
  opts: UseContentOptions = {},
): UseContentResult {
  const lang = opts.lang ?? 'en';
  const fallback = opts.fallback ?? '';
  const [resolved, setResolved] = useState<ResolvedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    fetchContent(key, { lang, fallback })
      .then((result) => {
        if (mounted) {
          setResolved(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [key, lang, fallback]);

  // Resolve the displayed value at the consumer boundary. For image keys,
  // relative BE URLs (admin uploads) are upgraded to absolute URLs using
  // `NEXT_PUBLIC_IMAGE_BASE_URL` (or the FE proxy fallback). For external
  // URLs and empty inputs, resolveMediaUrl is a no-op.
  const rawVal = resolved?.val ?? fallback;
  const displayed = isImageKey(key) ? resolveMediaUrl(rawVal, fallback) : rawVal;

  return {
    val: displayed,
    isLoading,
    error,
    fallbackUsed: resolved?.fallbackUsed ?? (resolved === null && fallback !== ''),
    isActive: resolved?.isActive ?? true,
  };
}
