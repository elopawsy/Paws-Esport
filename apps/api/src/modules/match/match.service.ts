import { Injectable, NotFoundException } from '@nestjs/common';

import type { VideoGameSlug } from '../../infrastructure/pandascore/pandascore.types';
import { MatchRepository } from './match.repository';
import type { Match, MatchStatus } from './match.types';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

@Injectable()
export class MatchService {
  constructor(private readonly repository: MatchRepository) {}

  public listByStatus(game: VideoGameSlug, status: MatchStatus, limit?: number): Promise<Match[]> {
    const cleanLimit = clampLimit(limit);
    return this.repository.listByStatus(game, status, cleanLimit);
  }

  public async getById(matchId: number | string): Promise<Match> {
    const match = await this.repository.getById(matchId);
    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }
    return match;
  }
}

function clampLimit(limit: number | undefined): number {
  if (!limit) return DEFAULT_LIMIT;
  return Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);
}
