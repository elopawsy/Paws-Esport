import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

import {
  getPandaScoreSlug,
  type PandaScoreParams,
  type VideoGameSlug,
} from './pandascore.types';

const PANDASCORE_BASE_URL = 'https://api.pandascore.co';

/**
 * Thin HTTP client around the PandaScore REST API.
 * The client is intentionally untyped on responses — domain
 * repositories own the mapping into our DTOs, so we don't leak
 * PandaScore's surface beyond infrastructure.
 */
@Injectable()
export class PandaScoreClient {
  private readonly logger = new Logger(PandaScoreClient.name);
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.PANDASCORE_API_KEY ?? '';
    if (!this.apiKey) {
      this.logger.warn('PANDASCORE_API_KEY is not set — every PandaScore call will fail');
    }
  }

  public isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  public async fetch<T>(path: string, params: PandaScoreParams = {}): Promise<T> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('PandaScore API key not configured');
    }

    const cleanParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      cleanParams[key] = String(value);
    }
    const search = new URLSearchParams(cleanParams).toString();
    const url = `${PANDASCORE_BASE_URL}${path}${search ? `?${search}` : ''}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const detail = `${response.status} ${response.statusText}`;
      this.logger.warn(`PandaScore call failed: ${detail} for ${path}`);
      throw new ServiceUnavailableException(`PandaScore upstream error: ${detail}`);
    }

    return (await response.json()) as T;
  }

  public getTournaments<T>(game: VideoGameSlug, params: PandaScoreParams = {}): Promise<T> {
    return this.fetch<T>(`/${getPandaScoreSlug(game)}/tournaments`, params);
  }

  public getTournamentById<T>(tournamentId: number | string): Promise<T> {
    return this.fetch<T>(`/tournaments/${tournamentId}`);
  }

  public getTournamentMatches<T>(tournamentId: number | string, params: PandaScoreParams = {}): Promise<T> {
    return this.fetch<T>(`/tournaments/${tournamentId}/matches`, params);
  }

  public getMatches<T>(game: VideoGameSlug, params: PandaScoreParams = {}): Promise<T> {
    return this.fetch<T>(`/${getPandaScoreSlug(game)}/matches`, params);
  }

  public getMatchById<T>(matchId: number | string): Promise<T> {
    return this.fetch<T>(`/matches/${matchId}`);
  }
}
