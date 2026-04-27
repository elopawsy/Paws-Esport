import { Injectable, NotFoundException } from '@nestjs/common';

import type { VideoGameSlug } from '../../infrastructure/pandascore/pandascore.types';
import { TournamentRepository } from './tournament.repository';
import type { Tournament, TournamentBuckets } from './tournament.types';

@Injectable()
export class TournamentService {
  constructor(private readonly repository: TournamentRepository) {}

  /**
   * Group tournaments into running/upcoming/past based on their dates.
   * The repository already caches the underlying PandaScore call so
   * the bucketing runs cheaply in-process.
   */
  public async listForGame(game: VideoGameSlug): Promise<TournamentBuckets> {
    const [recent, upcoming] = await Promise.all([
      this.repository.listForGame(game),
      this.repository.listUpcomingForGame(game),
    ]);

    const now = Date.now();
    const running: Tournament[] = [];
    const past: Tournament[] = [];

    for (const tournament of recent) {
      const begin = tournament.beginAt ? new Date(tournament.beginAt).getTime() : null;
      const end = tournament.endAt ? new Date(tournament.endAt).getTime() : null;

      if (begin !== null && begin <= now && (end === null || end >= now)) {
        running.push(tournament);
      } else if (end !== null && end < now) {
        past.push(tournament);
      }
    }

    return {
      running,
      upcoming: upcoming.filter((t) => t.beginAt && new Date(t.beginAt).getTime() > now),
      past: past.sort(byEndDateDesc),
    };
  }

  public async getByIdOrSlug(idOrSlug: number | string): Promise<Tournament> {
    const tournament = await this.repository.getByIdOrSlug(idOrSlug);
    if (!tournament) {
      throw new NotFoundException(`Tournament ${idOrSlug} not found`);
    }
    return tournament;
  }
}

function byEndDateDesc(a: Tournament, b: Tournament): number {
  const aTime = a.endAt ? new Date(a.endAt).getTime() : 0;
  const bTime = b.endAt ? new Date(b.endAt).getTime() : 0;
  return bTime - aTime;
}
