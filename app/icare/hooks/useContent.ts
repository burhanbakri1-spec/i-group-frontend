'use client';

import { useEffect, useState } from 'react';
import { fetchContent, ContentLocale } from '../lib/content-client';

export interface UseContentOptions {
  lang?: ContentLocale;
  fallback?: string;
}

export function useContent(key: string, opts: UseContentOptions = {}) {
  const lang = opts.lang ?? 'en';
  const fallback = opts.fallback ?? '';
  const [val, setVal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    fetchContent(key as any, { lang, fallback })
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
