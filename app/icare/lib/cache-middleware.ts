type QueryValue = string | number | boolean | null | undefined;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PendingEntry<T> {
  promise: Promise<T>;
}

const CACHE_TIERS = {
  reference: 5 * 60 * 1000,
  userProfile: 5 * 60 * 1000,
  list: 30 * 1000,
  realtime: 0,
} as const;

type CacheTier = keyof typeof CACHE_TIERS;

const normalizeKey = (path: string, query?: Record<string, QueryValue>): string => {
  const tenantScope = typeof window === 'undefined'
    ? 'server'
    : `${window.location.host}:${window.location.pathname.split('/').filter(Boolean)[0] || 'root'}`;
  let normalized = `${tenantScope}:${path.replace(/\/$/, '')}`;
  if (!query || Object.keys(query).length === 0) return normalized;
  const sorted = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${String(v)}`);
  return sorted.length ? `${normalized}?${sorted.join('&')}` : normalized;
};

class CacheMiddleware {
  private store = new Map<string, CacheEntry<unknown>>();
  private pending = new Map<string, PendingEntry<unknown>>();

  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return entry as CacheEntry<T>;
  }

  getFresh<T>(key: string, tier: CacheTier): { data: T; fresh: boolean } {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return { data: null as unknown as T, fresh: false };
    const ttl = tier === 'realtime' ? 0 : CACHE_TIERS[tier];
    const age = Date.now() - entry.timestamp;
    return { data: entry.data, fresh: ttl > 0 && age <= ttl };
  }

  set<T>(key: string, data: T, tier: CacheTier = 'list'): void {
    this.store.set(key, { data, timestamp: Date.now(), ttl: CACHE_TIERS[tier] });
  }

  getPending<T>(key: string): Promise<T> | null {
    const entry = this.pending.get(key);
    return entry ? (entry.promise as Promise<T>) : null;
  }

  setPending<T>(key: string, promise: Promise<T>): void {
    this.pending.set(key, { promise });
    promise.finally(() => {
      if (this.pending.get(key)?.promise === promise) {
        this.pending.delete(key);
      }
    });
  }

  invalidate(prefix: string): void {
    const normalized = prefix.replace(/\/$/, '');
    for (const key of this.store.keys()) {
      if (key.startsWith(normalized)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
    this.pending.clear();
  }
}

export const cacheMiddleware = new CacheMiddleware();

export async function cachedFetch<T>(
  path: string,
  fetchFn: () => Promise<T>,
  options: { tier?: CacheTier; query?: Record<string, QueryValue> } = {},
): Promise<T> {
  const { tier = 'list', query } = options;
  const key = normalizeKey(path, query);

  const cached = cacheMiddleware.getFresh<T>(key, tier);

  // Cache hit (fresh or stale) — return immediately and refresh in the
  // background. Callers never block on a fetch when cached data exists;
  // the cache is a display buffer so the UI never flashes an empty state
  // while a request is in flight.
  if (cached.data !== null) {
    if (!cached.fresh) {
      fetchFn()
        .then((fresh) => cacheMiddleware.set(key, fresh, tier))
        .catch(() => {
          /* keep stale cache on refresh failure */
        });
    }
    return cached.data;
  }

  // Cache miss — no choice but to fetch. Dedupe concurrent calls on the
  // same key so we don't fire N parallel requests for the same resource.
  const pending = cacheMiddleware.getPending<T>(key);
  if (pending) return pending;

  const promise = fetchFn()
    .then((data) => {
      cacheMiddleware.set(key, data, tier);
      return data;
    })
    .catch((error) => {
      throw error;
    });

  cacheMiddleware.setPending(key, promise);
  return promise;
}

export function invalidateOnMutation(endpoint: string): void {
  cacheMiddleware.invalidate(endpoint);
}

export { CACHE_TIERS };
export type { CacheTier, QueryValue };
