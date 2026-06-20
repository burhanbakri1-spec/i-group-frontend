'use client';

import { useEffect, useState } from 'react';

export interface UseVerifiedImageResult {
  /**
   * The URL we believe is renderable. `null` while we are still
   * validating; the consumer should render nothing (or a placeholder)
   * until this resolves.
   */
  url: string | null;
  /** True once the URL has been confirmed to load successfully. */
  verified: boolean;
  /** True if the URL failed to load (network error, 404, decode error). */
  failed: boolean;
}

/**
 * useVerifiedImage — depend on successful image render, then expose
 * the fetched URL.
 *
 * Pre-loads the URL with a hidden `Image` and only marks `verified: true`
 * once the browser fires `onload`. Consumers should treat `verified`
 * as the gate: don't pass `url` to a visible `<img>` until it's true,
 * and don't fall back to a stale value once it's true.
 *
 * Why: the spec 005 shim fell back to a hardcoded literal whenever the
 * BE returned empty — which masked BE outages and made the hero image
 * look "stuck" on an old URL even after the admin updated the registry.
 * This hook lets callers render nothing (or the explicit fallbackImage)
 * until the BE's URL is genuinely loadable.
 */
export function useVerifiedImage(src: string | null | undefined): UseVerifiedImageResult {
  const [verified, setVerified] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) {
      setVerified(false);
      setFailed(false);
      return;
    }
    let cancelled = false;
    setVerified(false);
    setFailed(false);
    const probe = new Image();
    probe.onload = () => {
      if (!cancelled) setVerified(true);
    };
    probe.onerror = () => {
      if (!cancelled) setFailed(true);
      if (process.env.NODE_ENV !== 'production') console.warn('[useVerifiedImage] probe failed for:', src);
    };
    probe.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src) return { url: null, verified: false, failed: false };
  if (failed) return { url: null, verified: false, failed: true };
  return { url: verified ? src : null, verified, failed };
}
