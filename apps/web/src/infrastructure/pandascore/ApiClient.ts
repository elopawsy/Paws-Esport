/**
 * Custom PandaScore API Client
 * 
 * Direct fetch implementation to bypass SDK limitations and support all games.
 * Implements intelligent caching based on data type.
 */
import { env } from './../config/env';
import { getApiSlug } from './gameSlugMapper';
import type { VideoGameSlug } from './gameSlugMapper';

/**
 * Revalidation times in seconds for different data types
 */
const REVALIDATE = {
  LIVE: 30,          // Running matches, live data
  UPCOMING: 300,     // Upcoming matches, 5 minutes
  PAST: 3600,        // Finished matches, 1 hour (they don't change)
  TEAMS: 1800,       // Team data, 30 minutes
  TOURNAMENTS: 600,  // Tournament info, 10 minutes
  DEFAULT: 300,      // Default, 5 minutes
} as const;

/**
 * Determine revalidation time based on endpoint and params
 */
function getRevalidateTime(path: string, params: Record<string, any>): number {
  const status = params['filter[status]'];
  
  if (status === 'running') return REVALIDATE.LIVE;
  if (status === 'finished') return REVALIDATE.PAST;
  if (status === 'not_started') return REVALIDATE.UPCOMING;
  
  if (path.includes('/teams')) return REVALIDATE.TEAMS;
  if (path.includes('/tournaments')) return REVALIDATE.TOURNAMENTS;
  
  return REVALIDATE.DEFAULT;
}

export class ApiClient {
  private baseUrl = 'https://api.pandascore.co';
  private apiKey: string;

  constructor() {
    this.apiKey = env.PANDASCORE_API_KEY || '';
  }

  private async fetch<T>(path: string, params: Record<string, any> = {}): Promise<{ data: T }> {
    if (!this.apiKey) {
      throw new Error('PandaScore API Key not configured');
    }

    // Filter out undefined/null params
    const cleanParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleanParams[key] = String(value);
      }
    });

    const searchParams = new URLSearchParams(cleanParams);
    const queryString = searchParams.toString();
    const url = `${this.baseUrl}${path}${queryString ? `?${queryString}` : ''}`;

    // Determine optimal revalidation time based on endpoint
    const revalidateTime = getRevalidateTime(path, params);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
      },
      next: { 
        revalidate: revalidateTime,
        tags: ['pandascore', path.split('/')[1] || 'api'],
      }
    });

    if (!response.ok) {
      throw new Error(`PandaScore API Error: ${response.status} ${response.statusText} - ${url}`);
    }

    const data = await response.json();
    return { data };
  }

  /**
   * Get teams for a specific video game
   */
  async getTeams(videogame: VideoGameSlug, params: any = {}) {
    const slug = getApiSlug(videogame);
    // Endpoint: /<game>/teams
    return this.fetch<any[]>(`/${slug}/teams`, params);
  }

  async getTeamById(id: number) {
    return this.fetch<any>(`/teams/${id}`);
  }

  async getGlobalTeams(params: any = {}) {
    return this.fetch<any[]>('/teams', params);
  }

  async getTeamMatches(id: number, params: any = {}) {
    return this.fetch<any[]>(`/teams/${id}/matches`, params);
  }

  /**
   * Get players
   */
  async getPlayers(videogame: VideoGameSlug, params: any = {}) {
    const slug = getApiSlug(videogame);
    return this.fetch<any[]>(`/${slug}/players`, params);
  }

  async getGlobalPlayers(params: any = {}) {
    return this.fetch<any[]>('/players', params);
  }

  async getPlayerById(id: number) {
    return this.fetch<any>(`/players/${id}`);
  }

  /**
   * Matches
   */
  async getMatches(videogame: VideoGameSlug, params: any = {}) {
    const slug = getApiSlug(videogame);
    return this.fetch<any[]>(`/${slug}/matches`, params);
  }

  async getGlobalMatches(params: any = {}) {
    return this.fetch<any[]>('/matches', params);
  }

  /**
   * Tournaments
   */
  async getTournaments(videogame: VideoGameSlug, params: any = {}) {
    const slug = getApiSlug(videogame);
    return this.fetch<any>(`/${slug}/tournaments`, params);
  }

  async getTournamentById(id: number | string) {
    return this.fetch<any>(`/tournaments/${id}`);
  }

  async getTournamentMatches(id: number | string, params: any = {}) {
    return this.fetch<any>(`/tournaments/${id}/matches`, params);
  }

  /**
   * Games - CS2/CSGO specific
   */
  async getMatchGames(matchId: number) {
    return this.fetch<any[]>(`/csgo/matches/${matchId}/games`);
  }

  async getGameById(gameId: number) {
    return this.fetch<any>(`/csgo/games/${gameId}`);
  }

  async getGameRounds(gameId: number) {
    return this.fetch<any[]>(`/csgo/games/${gameId}/rounds`);
  }

  /**
   * Match Statistics
   */
  async getMatchPlayersStats(matchId: number) {
    return this.fetch<any[]>(`/csgo/matches/${matchId}/players/stats`);
  }

  async getMatchById(matchId: number) {
    return this.fetch<any>(`/matches/${matchId}`);
  }


}

export const apiClient = new ApiClient();
