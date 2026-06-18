'use client';

import { useEffect, useState } from 'react';
import { fetchContent, ContentLocale } from '../lib/content-client';
import type { ContentKeys } from '../lib/content-keys';

export interface UseContentOptions {
  lang?: ContentLocale;
  fallback?: string;
}

// Type-safe overload — caller gets autocomplete on the ContentKeys type.
export function useContent<K extends keyof ContentKeys>(
  key: K,
  opts?: UseContentOptions,
): { val: string; isLoading: boolean; error: Error | null; fallbackUsed: boolean };

// Untyped escape hatch — used by the useSiteContent shim where the key list
// spans more fields than the auto-generated ContentKeys type covers (the
// shim is the migration bridge; a missing key falls back to the literal
// passed in `opts.fallback`).
export function useContent(
  key: string,
  opts?: UseContentOptions,
): { val: string; isLoading: boolean; error: Error | null; fallbackUsed: boolean };

export function useContent(
  key: string,
  opts: UseContentOptions = {},
) {
  const lang = opts.lang ?? 'en';
  const fallback = opts.fallback ?? '';
  const [val, setVal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    fetchContent(key, { lang, fallback })
      .then((resolved) => {
        if (mounted) {
          setVal(resolved);
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

  return {
    val: val ?? fallback,
    isLoading,
    error,
    fallbackUsed: val === fallback && fallback !== '',
  };
}
