/**
 * lib/showcase/demo-mode.ts — Demo mode gate.
 * Returns true only when ?demo=1 is explicitly set.
 */

export const isDemoMode = (searchParams: URLSearchParams): boolean =>
  searchParams.get('demo') === '1';
