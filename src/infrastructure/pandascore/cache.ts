/**
 * Smart Cache System with intelligent TTLs per data type
 * 
 * TTL Strategy:
 * - Rosters: 24 hours (players don't change often)
 * - Teams: 1 hour (basic team info)
 * - Past matches: 7 days (finished, won't change)
 * - Running matches: 30 seconds (live updates needed)
 * - Upcoming matches: 5 minutes
 * - Tournaments: 1 hour
 * - Head-to-head: 1 hour
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
  createdAt: number;
}

// In-memory cache
const cache = new Map<string, CacheEntry<unknown>>();

// Cache TTLs in milliseconds
export const CACHE_TTL = {
  ROSTER: 24 * 60 * 60 * 1000,        // 24 hours
  TEAM: 60 * 60 * 1000,                // 1 hour
  PAST_MATCH: 7 * 24 * 60 * 60 * 1000, // 7 days (finished matches don't change)
  RUNNING_MATCH: 30 * 1000,            // 30 seconds
  UPCOMING_MATCH: 5 * 60 * 1000,       // 5 minutes
  HEAD_TO_HEAD: 60 * 60 * 1000,        // 1 hour
  RECENT_FORM: 30 * 60 * 1000,         // 30 minutes
  TOURNAMENT: 60 * 60 * 1000,          // 1 hour
  TOURNAMENT_MATCHES: 5 * 60 * 1000,   // 5 minutes
  DEFAULT: 10 * 60 * 1000,             // 10 minutes
} as const;

// Cache key prefixes for organization
export const CACHE_KEYS = {
  roster: (teamId: number) => `roster:${teamId}`,
  team: (teamId: number) => `team:${teamId}`,
  match: (matchId: number | string) => `match:${matchId}`,
  h2h: (team1Id: number, team2Id: number) => `h2h:${Math.min(team1Id, team2Id)}-${Math.max(team1Id, team2Id)}`,
  recentForm: (teamId: number) => `form:${teamId}`,
  tournament: (id: number | string) => `tournament:${id}`,
  tournamentMatches: (id: number | string) => `tournament-matches:${id}`,
  tournaments: (game: string, status: string) => `tournaments:${game}:${status}`,
} as const;

/**
 * Get data from cache if not expired
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

/**
 * Set data in cache with TTL
 */
export function setInCache<T>(key: string, data: T, ttl: number = CACHE_TTL.DEFAULT): void {
  cache.set(key, { 
    data, 
    expiry: Date.now() + ttl,
    createdAt: Date.now(),
  });
}

/**
 * Get cache TTL based on match status
 */
export function getMatchTTL(status: string): number {
  switch (status) {
    case 'running':
      return CACHE_TTL.RUNNING_MATCH;
    case 'finished':
    case 'canceled':
      return CACHE_TTL.PAST_MATCH;
    case 'not_started':
      return CACHE_TTL.UPCOMING_MATCH;
    default:
      return CACHE_TTL.DEFAULT;
  }
}

/**
 * Clear specific cache key
 */
export function clearCache(key: string): void {
  cache.delete(key);
}

/**
 * Clear cache by prefix (e.g., clear all rosters)
 */
export function clearCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Get cache stats (for debugging)
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
  memoryEstimate: string;
} {
  let totalSize = 0;
  for (const [key, value] of cache.entries()) {
    totalSize += key.length + JSON.stringify(value.data).length;
  }
  
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    memoryEstimate: `~${Math.round(totalSize / 1024)}KB`,
  };
}

/**
 * Check if cache entry exists and is valid
 */
export function isCached(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return false;
  return Date.now() <= entry.expiry;
}

/**
 * Get remaining TTL for a cache entry
 */
export function getRemainingTTL(key: string): number | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const remaining = entry.expiry - Date.now();
  return remaining > 0 ? remaining : null;
}

/**
 * Cached fetch helper - returns cached data or fetches fresh
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.DEFAULT
): Promise<T> {
  // Check cache first
  const cached = getFromCache<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Cache the result
  setInCache(key, data, ttl);
  
  return data;
}
