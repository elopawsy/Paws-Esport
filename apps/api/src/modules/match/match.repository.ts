import { Injectable } from '@nestjs/common';

import {
  CACHE_TTL,
  PandaScoreCache,
} from '../../infrastructure/pandascore/pandascore.cache';
import { PandaScoreClient } from '../../infrastructure/pandascore/pandascore.client';
import type { VideoGameSlug } from '../../infrastructure/pandascore/pandascore.types';
import { toMatch, type RawMatch } from './match.mapper';
import type { Match, MatchStatus } from './match.types';

const STATUS_FILTER: Record<MatchStatus, string> = {
  running: 'running',
  not_started: 'not_started',
  finished: 'finished',
  canceled: 'canceled',
  postponed: 'postponed',
};

@Injectable()
export class MatchRepository {
  constructor(
    private readonly client: PandaScoreClient,
    private readonly cache: PandaScoreCache,
  ) {}

  public listByStatus(game: VideoGameSlug, status: MatchStatus, limit: number): Promise<Match[]> {
    const ttl = pickTtl(status);
    return this.cache.wrap(`matches:${game}:${status}:${limit}`, ttl, async () => {
      const raw = await this.client.getMatches<RawMatch[]>(game, {
        'filter[status]': STATUS_FILTER[status],
        'page[size]': limit,
        sort: status === 'finished' ? '-end_at' : status === 'running' ? '-begin_at' : 'scheduled_at',
      });
      return raw.map(toMatch);
    });
  }

  public async getById(matchId: number | string): Promise<Match | null> {
    return this.cache.wrap(`match:${matchId}`, CACHE_TTL.UPCOMING_MATCH, async () => {
      const raw = await this.client.getMatchById<RawMatch | RawMatch[]>(matchId);
      const single = Array.isArray(raw) ? raw[0] : raw;
      return single ? toMatch(single) : null;
    });
  }
}

function pickTtl(status: MatchStatus): number {
  switch (status) {
    case 'running':
      return CACHE_TTL.RUNNING_MATCH;
    case 'finished':
    case 'canceled':
      return CACHE_TTL.PAST_MATCH;
    case 'not_started':
    case 'postponed':
      return CACHE_TTL.UPCOMING_MATCH;
    default:
      return CACHE_TTL.DEFAULT;
  }
}
