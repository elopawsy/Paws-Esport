import core from '@nestia/core';
import { Controller } from '@nestjs/common';

import { Public } from '../../infrastructure/auth/public.decorator';
import type { VideoGameSlug } from '../../infrastructure/pandascore/pandascore.types';
import { MatchService } from './match.service';
import type { Match, MatchStatus } from './match.types';

interface ListMatchesQuery {
  game?: VideoGameSlug;
  status?: MatchStatus;
  limit?: number;
}

@Public()
@Controller('matches')
export class MatchController {
  constructor(private readonly service: MatchService) {}

  /**
   * List matches for a given video game and status.
   * Defaults to upcoming Counter-Strike 2 matches.
   */
  @core.TypedRoute.Get()
  public list(@core.TypedQuery() query: ListMatchesQuery): Promise<Match[]> {
    return this.service.listByStatus(
      query.game ?? 'cs-2',
      query.status ?? 'not_started',
      query.limit,
    );
  }

  /**
   * Fetch a single match by its numeric PandaScore id or slug.
   */
  @core.TypedRoute.Get(':idOrSlug')
  public getOne(@core.TypedParam('idOrSlug') idOrSlug: string): Promise<Match> {
    const numeric = Number(idOrSlug);
    return this.service.getById(Number.isFinite(numeric) ? numeric : idOrSlug);
  }
}
