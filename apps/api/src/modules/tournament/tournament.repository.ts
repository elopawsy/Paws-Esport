import { Injectable } from '@nestjs/common';

import {
  CACHE_TTL,
  PandaScoreCache,
} from '../../infrastructure/pandascore/pandascore.cache';
import { PandaScoreClient } from '../../infrastructure/pandascore/pandascore.client';
import type { VideoGameSlug } from '../../infrastructure/pandascore/pandascore.types';
import type { Tournament } from './tournament.types';

interface RawTournament {
  id: number;
  slug: string;
  name: string;
  tier: string | null;
  begin_at: string | null;
  end_at: string | null;
  prizepool: string | null;
  league: { id: number; name: string; image_url: string | null } | null;
  serie: { id: number; name: string | null; full_name: string | null } | null;
}

@Injectable()
export class TournamentRepository {
  constructor(
    private readonly client: PandaScoreClient,
    private readonly cache: PandaScoreCache,
  ) {}

  public listForGame(game: VideoGameSlug): Promise<Tournament[]> {
    return this.cache.wrap(`tournaments:${game}:all`, CACHE_TTL.TOURNAMENT, async () => {
      const raw = await this.client.getTournaments<RawTournament[]>(game, {
        'page[size]': 50,
        sort: '-begin_at',
      });
      return raw.map(toDomain);
    });
  }

  public listUpcomingForGame(game: VideoGameSlug): Promise<Tournament[]> {
    const nowIso = new Date().toISOString();
    return this.cache.wrap(`tournaments:${game}:upcoming`, CACHE_TTL.TOURNAMENT, async () => {
      const raw = await this.client.getTournaments<RawTournament[]>(game, {
        'page[size]': 50,
        sort: 'begin_at',
        'range[begin_at]': `${nowIso},2099-12-31T23:59:59Z`,
      });
      return raw.map(toDomain);
    });
  }

  public async getByIdOrSlug(idOrSlug: number | string): Promise<Tournament | null> {
    return this.cache.wrap(`tournament:${idOrSlug}`, CACHE_TTL.TOURNAMENT, async () => {
      const raw = await this.client.getTournamentById<RawTournament | RawTournament[]>(idOrSlug);
      const single = Array.isArray(raw) ? raw[0] : raw;
      return single ? toDomain(single) : null;
    });
  }
}

function toDomain(raw: RawTournament): Tournament {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    tier: raw.tier,
    beginAt: raw.begin_at,
    endAt: raw.end_at,
    prizepool: raw.prizepool,
    league: raw.league
      ? { id: raw.league.id, name: raw.league.name, imageUrl: raw.league.image_url }
      : null,
    serie: raw.serie
      ? { id: raw.serie.id, name: raw.serie.name, fullName: raw.serie.full_name }
      : null,
  };
}
