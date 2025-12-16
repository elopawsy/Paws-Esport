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
  getApiSlug,
  getApiId,
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
 * Get tournaments for a specific videogame.
 * Uses /videogames/{id}/tournaments endpoint which properly filters by game.
 */
async function getTournamentsForGame(videogame: VideoGameSlug): Promise<TournamentFull[]> {
  const apiId = getApiId(videogame);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await pandaScoreSDK.get_videogames_videogameIdOrSlug_tournaments({
    videogame_id_or_slug: apiId as any, // SDK types are too strict, API accepts numeric ID
    'page[size]': '50',
    sort: ['-begin_at'],
  });
  return (response.data as unknown[]).map(mapTournament);
}


/**
 * Get running tournaments for a game
 */
export async function getRunningTournaments(videogame: VideoGameSlug = 'cs-2'): Promise<TournamentFull[]> {
  const cached = getFromCache<TournamentFull[]>(CACHE_KEY_TOURNAMENTS(videogame, 'running'));
  if (cached) return cached;

  if (!isSDKConfigured()) return [];

  try {
    const allTournaments = await getTournamentsForGame(videogame);
    const now = new Date();
    
    // Filter running: begin_at <= now AND (end_at >= now OR end_at is null)
    const running = allTournaments.filter(t => {
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
    const allTournaments = await getTournamentsForGame(videogame);
    const now = new Date();
    
    // Filter upcoming: begin_at > now
    const upcoming = allTournaments
      .filter(t => t.begin_at && new Date(t.begin_at) > now)
      .sort((a, b) => new Date(a.begin_at!).getTime() - new Date(b.begin_at!).getTime());

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
    const allTournaments = await getTournamentsForGame(videogame);
    const now = new Date();
    
    // Filter past: end_at < now
    const past = allTournaments
      .filter(t => t.end_at && new Date(t.end_at) < now)
      .sort((a, b) => new Date(b.end_at!).getTime() - new Date(a.end_at!).getTime());

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
    const apiId = getApiId(videogame);
    const response = await pandaScoreSDK.get_tournaments({
      'filter[videogame]': apiId,
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
export async function getAllTournaments(videogame: VideoGameSlug = 'cs-2') {
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
