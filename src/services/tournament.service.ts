/**
 * Tournament Service
 * 
 * Business logic for tournament-related operations.
 */

import type { TournamentFull, Match, TournamentTier } from '@/types';
import {
  isSDKConfigured,
  getFromCache,
  setInCache,
  mapMatch,
} from '@/infrastructure/pandascore';
import { apiClient } from '../infrastructure/pandascore/ApiClient';
import type { VideoGameSlug } from '@/infrastructure/pandascore/gameSlugMapper';

const CACHE_KEY_TOURNAMENTS = (game: VideoGameSlug, status: string) => `${game}-tournaments-${status}-v2`;
const CACHE_KEY_TOURNAMENT = (id: number | string) => `tournament-${id}`;
const CACHE_KEY_TOURNAMENT_MATCHES = (id: number | string) => `tournament-${id}-matches`;

// Local mapper to avoid circular imports or missing exports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTournament(t: any): TournamentFull {
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    tier: t.tier || null,
    begin_at: t.begin_at || null,
    end_at: t.end_at || null,
    prizepool: t.prizepool || null,
    league: t.league || null,
    serie: t.serie || null,
    teams: t.teams || [],
  };
}

/**
 * Get running tournaments for a game
 */
export async function getRunningTournaments(videogame: VideoGameSlug = 'cs-2'): Promise<TournamentFull[]> {
  const cached = getFromCache<TournamentFull[]>(CACHE_KEY_TOURNAMENTS(videogame, 'running'));
  if (cached) return cached;

  if (!isSDKConfigured()) return [];

  try {
    const response = await apiClient.getTournaments(videogame, {
      'page[size]': 50,
      sort: '-begin_at',
    });

    const now = new Date();
    const all = response.data.map(mapTournament);
    const running = all.filter((t: TournamentFull) => {
      if (!t.begin_at) return false;
      const begin = new Date(t.begin_at);
      const end = t.end_at ? new Date(t.end_at) : null;
      return begin <= now && (!end || end >= now);
    });

    setInCache(CACHE_KEY_TOURNAMENTS(videogame, 'running'), running);
    return running;
  } catch (error) {
    console.error('Failed to fetch running tournaments:', error);
    return [];
  }
}

/**
 * Get upcoming tournaments for a game
 */
export async function getUpcomingTournaments(videogame: VideoGameSlug = 'cs-2'): Promise<TournamentFull[]> {
  const cached = getFromCache<TournamentFull[]>(CACHE_KEY_TOURNAMENTS(videogame, 'upcoming'));
  if (cached) return cached;

  if (!isSDKConfigured()) return [];

  try {
    // Fetch upcoming by sorting by begin_at (ascending)
    const response = await apiClient.getTournaments(videogame, {
      'page[size]': 50,
      sort: 'begin_at',
      'range[begin_at]': `${new Date().toISOString()},`
    });

    const now = new Date();
    const all = response.data.map(mapTournament);
    const upcoming = all
      .filter((t: TournamentFull) => t.begin_at && new Date(t.begin_at) > now)
      .sort((a: TournamentFull, b: TournamentFull) => new Date(a.begin_at!).getTime() - new Date(b.begin_at!).getTime());

    setInCache(CACHE_KEY_TOURNAMENTS(videogame, 'upcoming'), upcoming);
    return upcoming;
  } catch (error) {
    console.error('Failed to fetch upcoming tournaments:', error);
    return [];
  }
}

/**
 * Get past tournaments for a game
 */
export async function getPastTournaments(videogame: VideoGameSlug = 'cs-2'): Promise<TournamentFull[]> {
  const cached = getFromCache<TournamentFull[]>(CACHE_KEY_TOURNAMENTS(videogame, 'past'));
  if (cached) return cached;

  if (!isSDKConfigured()) return [];

  try {
    const response = await apiClient.getTournaments(videogame, {
      'page[size]': 50,
      sort: '-end_at',
    });

    const now = new Date();
    const all = response.data.map(mapTournament);
    const past = all
      .filter((t: TournamentFull) => t.end_at && new Date(t.end_at) < now)
      .sort((a: TournamentFull, b: TournamentFull) => new Date(b.end_at!).getTime() - new Date(a.end_at!).getTime());

    setInCache(CACHE_KEY_TOURNAMENTS(videogame, 'past'), past);
    return past;
  } catch (error) {
    console.error('Failed to fetch past tournaments:', error);
    return [];
  }
}

/**
 * Get tournaments by tier
 */
export async function getTournamentsByTier(tier: TournamentTier, videogame: VideoGameSlug = 'cs-2'): Promise<TournamentFull[]> {
  if (!isSDKConfigured()) return [];

  try {
    const response = await apiClient.getTournaments(videogame, {
      'filter[tier]': tier,
      'page[size]': 50,
      sort: '-begin_at',
    });
    return response.data.map(mapTournament);
  } catch (error) {
    console.error(`Failed to fetch ${tier} tournaments:`, error);
    return [];
  }
}

/**
 * Get tournament by ID or Slug
 */
export async function getTournamentById(tournamentId: number | string): Promise<TournamentFull | null> {
  const cached = getFromCache<TournamentFull>(CACHE_KEY_TOURNAMENT(tournamentId));
  if (cached) return cached;

  if (!isSDKConfigured()) return null;

  try {
    const response = await apiClient.getTournamentById(tournamentId);
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    const tournament = mapTournament(data);
    setInCache(CACHE_KEY_TOURNAMENT(tournamentId), tournament);
    return tournament;
  } catch (error) {
    console.error(`Failed to fetch tournament ${tournamentId}:`, error);
    return null;
  }
}

/**
 * Get matches for a tournament
 */
export async function getTournamentMatches(tournamentId: number | string): Promise<Match[]> {
  const cached = getFromCache<Match[]>(CACHE_KEY_TOURNAMENT_MATCHES(tournamentId));
  if (cached) return cached;

  if (!isSDKConfigured()) return [];

  try {
    const response = await apiClient.getTournamentMatches(tournamentId, {
      'page[size]': 50,
      sort: '-scheduled_at',
    });

    const matches = response.data.map(mapMatch);
    setInCache(CACHE_KEY_TOURNAMENT_MATCHES(tournamentId), matches);
    return matches;
  } catch (error) {
    console.error(`Failed to fetch matches for tournament ${tournamentId}:`, error);
    return [];
  }
}

/**
 * Get all tournaments (running, upcoming, past) for a game
 */
export async function getAllTournaments(videogame: VideoGameSlug = 'cs-2') {
  const [running, upcoming, past] = await Promise.all([
    getRunningTournaments(videogame),
    getUpcomingTournaments(videogame),
    getPastTournaments(videogame),
  ]);

  return { running, upcoming, past };
}

/**
 * Get all tournaments for a specific series (e.g. all phases of a tournament)
 */
export async function getSeriesTournaments(serieId: number, videogame: VideoGameSlug = 'cs-2'): Promise<TournamentFull[]> {
  if (!isSDKConfigured()) return [];

  // Cache key could be improved, but for now simple time-based or just no long-term cache for this dynamic data?
  // Let's use a specific cache key for series.
  const CACHE_KEY_SERIES = (sId: number) => `series-${sId}-tournaments`;

  const cached = getFromCache<TournamentFull[]>(CACHE_KEY_SERIES(serieId));
  if (cached) return cached;

  try {
    const response = await apiClient.getTournaments(videogame, {
      'filter[serie_id]': serieId,
      'page[size]': 50,
      sort: 'begin_at', // Chronological order
    });

    const tournaments = response.data.map(mapTournament);
    setInCache(CACHE_KEY_SERIES(serieId), tournaments);
    return tournaments;
  } catch (error) {
    console.error(`Failed to fetch series ${serieId} tournaments:`, error);
    return [];
  }
}

/**
 * Tournament Service Object
 */
export const TournamentService = {
  getRunningTournaments,
  getUpcomingTournaments,
  getPastTournaments,
  getTournamentsByTier,
  getTournamentById,
  getTournamentMatches,
  getAllTournaments,
  getSeriesTournaments
};
