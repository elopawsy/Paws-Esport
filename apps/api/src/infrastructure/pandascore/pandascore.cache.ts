import { Injectable } from '@nestjs/common';

/**
 * Cache TTLs in milliseconds. Tuned to mirror the web client's policy
 * — running matches refresh fast, finished matches sit for a week.
 */
export const CACHE_TTL = {
  RUNNING_MATCH: 30 * 1000,
  UPCOMING_MATCH: 5 * 60 * 1000,
  PAST_MATCH: 7 * 24 * 60 * 60 * 1000,
  TEAM: 60 * 60 * 1000,
  ROSTER: 24 * 60 * 60 * 1000,
  TOURNAMENT: 60 * 60 * 1000,
  TOURNAMENT_MATCHES: 5 * 60 * 1000,
  HEAD_TO_HEAD: 60 * 60 * 1000,
  RECENT_FORM: 30 * 60 * 1000,
  DEFAULT: 10 * 60 * 1000,
} as const;

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * Single-process in-memory cache. Suitable for the API's read-mostly
 * PandaScore traffic; if we ever scale horizontally the cache moves
 * to Redis without changing the consumer surface.
 */
@Injectable()
export class PandaScoreCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttl: number = CACHE_TTL.DEFAULT): void {
    this.store.set(key, { data, expiry: Date.now() + ttl });
  }

  public async wrap<T>(key: string, ttl: number, loader: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await loader();
    this.set(key, fresh, ttl);
    return fresh;
  }

  public clear(prefix?: string): void {
    if (!prefix) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}
