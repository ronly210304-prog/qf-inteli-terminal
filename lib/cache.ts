/**
 * Minimal in-memory TTL cache for server-side data routes.
 *
 * HONEST LIMITATION: this is a plain module-level Map. It works as
 * intended on a long-lived Node.js server (e.g. `next start` on a VM,
 * or Vercel with a warm serverless instance). It does NOT persist
 * across serverless cold starts and is NOT shared across instances —
 * on a platform that spins up multiple function instances, each one
 * has its own empty cache. For this project's zero-cost goals that's
 * an acceptable tradeoff (it still cuts request volume under normal
 * traffic), but it is not a durable cache. A production deployment
 * that needs guaranteed cache hits would swap this for a shared store
 * (e.g. Redis) behind the same get/set interface.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** TTLs per data type, per spec section 22/13 (frequent price, infrequent macro). */
export const TTL = {
  quote: 15_000, // 15s — price data, refreshed often but still capped
  ohlc: 60_000, // 1min — bar series
  news: 5 * 60_000, // 5min — moderate
  macro: 6 * 60 * 60_000, // 6h — low frequency, official releases are infrequent
  sentiment: 60 * 60_000, // 1h — daily-ish source, hourly is generous headroom
  events: 60 * 60_000, // 1h — moderate
} as const;
