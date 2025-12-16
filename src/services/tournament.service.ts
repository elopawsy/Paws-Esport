/**
 * Tournament Service
 * 
 * Business logic for tournament-related operations.
 */

import type { TournamentFull, Match, TournamentTier } from '@/types';
import {
  pandaScoreSDK,
  isSDKConfigured,
  getFromCache,
  setInCache,
  mapMatch,
} from '@/infrastructure/pandascore';
import type { VideoGameSlug } from '@/infrastructure/pandascore';

const CACHE_KEY_TOURNAMENTS = (game: VideoGameSlug, status: string) => `${game}-tournaments-${status}-v1`;
const CACHE_KEY_TOURNAMENT = (id: number) => `tournament-${id}`;
const CACHE_KEY_TOURNAMENT_MATCHES = (id: number) => `tournament-${id}-matches`;

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
 * Get running tournaments
 */
export async function getRunningTournaments(videogame: VideoGameSlug = 'csgo'): Promise<TournamentFull[]> {
  const cached = getFromCache<TournamentFull[]>(CACHE_KEY_TOURNAMENTS(videogame, 'running'));
  if (cached) return cached;

  if (!isSDKConfigured()) return [];

  try {
    const response = await pandaScoreSDK.get_tournaments_running({
      'filter[videogame]': videogame,
      'page[size]': '20',
    });

    const tournaments = (response.data as unknown[]).map(mapTournament);
    setInCache(CACHE_KEY_TOURNAMENTS(videogame, 'running'), tournaments);
    return tournaments;
  } catch (error) {
    console.error('Failed to fetch running tournaments:', error);
    return [];
  }
}

/**
 * Get upcoming tournaments
 */
export async function getUpcomingTournaments(videogame: VideoGameSlug = 'csgo'): Promise<TournamentFull[]> {
  const cached = getFromCache<TournamentFull[]>(CACHE_KEY_TOURNAMENTS(videogame, 'upcoming'));
  if (cached) return cached;

  if (!isSDKConfigured()) return [];

  try {
    const response = await pandaScoreSDK.get_tournaments_upcoming({
      'filter[videogame]': videogame,
      'page[size]': '20',
      sort: ['begin_at'],
    });

    const tournaments = (response.data as unknown[]).map(mapTournament);
    setInCache(CACHE_KEY_TOURNAMENTS(videogame, 'upcoming'), tournaments);
    return tournaments;
  } catch (error) {
    console.error('Failed to fetch upcoming tournaments:', error);
    return [];
  }
}

/**
 * Get past tournaments
 */
export async function getPastTournaments(videogame: VideoGameSlug = 'csgo'): Promise<TournamentFull[]> {
  const cached = getFromCache<TournamentFull[]>(CACHE_KEY_TOURNAMENTS(videogame, 'past'));
  if (cached) return cached;

  if (!isSDKConfigured()) return [];

  try {
    const response = await pandaScoreSDK.get_tournaments_past({
      'filter[videogame]': videogame,
      'page[size]': '30',
      sort: ['-end_at'],
    });

    const tournaments = (response.data as unknown[]).map(mapTournament);
    setInCache(CACHE_KEY_TOURNAMENTS(videogame, 'past'), tournaments);
    return tournaments;
  } catch (error) {
    console.error('Failed to fetch past tournaments:', error);
    return [];
  }
}

/**
 * Get tournaments by tier
 */
export async function getTournamentsByTier(tier: TournamentTier, videogame: VideoGameSlug = 'csgo'): Promise<TournamentFull[]> {
  if (!isSDKConfigured()) return [];

  try {
    const response = await pandaScoreSDK.get_tournaments({
      'filter[videogame]': videogame,
      'filter[tier]': tier,
      'page[size]': '20',
      sort: ['-begin_at'],
    });

    return (response.data as unknown[]).map(mapTournament);
  } catch (error) {
    console.error(`Failed to fetch ${tier}-tier tournaments:`, error);
    return [];
  }
}

/**
 * Get tournament by ID
 */
export async function getTournamentById(tournamentId: number): Promise<TournamentFull | null> {
  const cached = getFromCache<TournamentFull>(CACHE_KEY_TOURNAMENT(tournamentId));
  if (cached) return cached;

  if (!isSDKConfigured()) return null;

  try {
    const response = await pandaScoreSDK.get_tournaments_tournamentIdOrSlug({
      tournament_id_or_slug: String(tournamentId),
    });

    const tournament = mapTournament(response.data);
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
export async function getTournamentMatches(tournamentId: number): Promise<Match[]> {
  const cached = getFromCache<Match[]>(CACHE_KEY_TOURNAMENT_MATCHES(tournamentId));
  if (cached) return cached;

  if (!isSDKConfigured()) return [];

  try {
    const response = await pandaScoreSDK.get_tournaments_tournamentIdOrSlug_matches({
      tournament_id_or_slug: String(tournamentId),
      'page[size]': '50',
      sort: ['-scheduled_at'],
    });

    const matches = (response.data as unknown[]).map(mapMatch);
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
export async function getAllTournaments(videogame: VideoGameSlug = 'csgo') {
  const [running, upcoming, past] = await Promise.all([
    getRunningTournaments(videogame),
    getUpcomingTournaments(videogame),
    getPastTournaments(videogame),
  ]);

  return { running, upcoming, past };
}

/**
 * Tournament Service object
 */
export const TournamentService = {
  getRunningTournaments,
  getUpcomingTournaments,
  getPastTournaments,
  getTournamentsByTier,
  getTournamentById,
  getTournamentMatches,
  getAllTournaments,
};
