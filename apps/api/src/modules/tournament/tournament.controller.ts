import core from '@nestia/core';
import { Controller } from '@nestjs/common';

import { Public } from '../../infrastructure/auth/public.decorator';
import type { VideoGameSlug } from '../../infrastructure/pandascore/pandascore.types';
import { TournamentService } from './tournament.service';
import type { Tournament, TournamentBuckets } from './tournament.types';

@Public()
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly service: TournamentService) {}

  /**
   * List tournaments for a video game grouped into running, upcoming
   * and past. Defaults to Counter-Strike 2 when the query param is
   * missing.
   */
  @core.TypedRoute.Get()
  public list(@core.TypedQuery() query: ListTournamentsQuery): Promise<TournamentBuckets> {
    return this.service.listForGame(query.game ?? 'cs-2');
  }

  /**
   * Fetch a single tournament by its numeric id or PandaScore slug.
   */
  @core.TypedRoute.Get(':idOrSlug')
  public getOne(@core.TypedParam('idOrSlug') idOrSlug: string): Promise<Tournament> {
    const numeric = Number(idOrSlug);
    return this.service.getByIdOrSlug(Number.isFinite(numeric) ? numeric : idOrSlug);
  }
}

interface ListTournamentsQuery {
  game?: VideoGameSlug;
}
