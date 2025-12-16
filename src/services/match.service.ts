/**
 * Match Service
 * 
 * Business logic for match-related operations.
 */

import type { Match, MatchesResponse, TournamentTier } from '@/types';
import {
  pandaScoreSDK,
  isSDKConfigured,
  getFromCache,
  setInCache,
  mapMatch,
  getApiSlug,
} from '@/infrastructure/pandascore';
import type { VideoGameSlug } from '@/infrastructure/pandascore';

const CACHE_KEY_MATCHES = (game: VideoGameSlug) => `${game}-matches-v2`;
const CACHE_TTL_DEFAULT = 5 * 60 * 1000; // 5 minutes

/**
 * Get live (running) matches
 */
export async function getLiveMatches(videogame: VideoGameSlug = 'cs-2'): Promise<Match[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const apiSlug = getApiSlug(videogame);
    const response = await pandaScoreSDK.get_matches_running({
      'filter[videogame]': apiSlug,
      'page[size]': '20',
    });

    return (response.data as unknown[]).map(mapMatch);
  } catch (error) {
    console.error('Failed to fetch live matches:', error);
    return [];
  }
}

/**
 * Get upcoming matches
 */
export async function getUpcomingMatches(videogame: VideoGameSlug = 'cs-2'): Promise<Match[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const apiSlug = getApiSlug(videogame);
    const response = await pandaScoreSDK.get_matches_upcoming({
      'filter[videogame]': apiSlug,
      'page[size]': '30',
      sort: ['scheduled_at'],
    });

    return (response.data as unknown[]).map(mapMatch);
  } catch (error) {
    console.error('Failed to fetch upcoming matches:', error);
    return [];
  }
}

/**
 * Get past matches
 */
export async function getPastMatches(videogame: VideoGameSlug = 'cs-2'): Promise<Match[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const apiSlug = getApiSlug(videogame);
    const response = await pandaScoreSDK.get_matches_past({
      'filter[videogame]': apiSlug,
      'page[size]': '50',
      sort: ['-end_at'],
    });

    return (response.data as unknown[]).map(mapMatch);
  } catch (error) {
    console.error('Failed to fetch past matches:', error);
    return [];
  }
}

/**
 * Get tournaments by tier
 */
export async function getTournamentsByTier(tier: TournamentTier, videogame: VideoGameSlug = 'cs-2'): Promise<{ id: number }[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const apiSlug = getApiSlug(videogame);
    const response = await pandaScoreSDK.get_tournaments({
      'filter[videogame]': apiSlug,
      'filter[tier]': tier,
      'page[size]': '10',
      sort: ['-begin_at'],
    });

    return (response.data as { id: number }[]).map(t => ({ id: t.id }));
  } catch (error) {
    console.error(`Failed to fetch ${tier}-tier tournaments:`, error);
    return [];
  }
}

/**
 * Get matches for a specific tournament
 */
export async function getMatchesForTournament(tournamentId: number): Promise<Match[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const response = await pandaScoreSDK.get_tournaments_tournamentIdOrSlug_matches({
      tournament_id_or_slug: String(tournamentId),
      'page[size]': '30',
      sort: ['-scheduled_at'],
    });

    return (response.data as unknown[]).map(mapMatch);
  } catch (error) {
    console.error(`Failed to fetch matches for tournament ${tournamentId}:`, error);
    return [];
  }
}

/**
 * Get all categorized matches (live, upcoming, past) with tier prioritization
 */
export async function getAllMatches(videogame: VideoGameSlug = 'cs-2'): Promise<MatchesResponse> {
  // Check cache first
  const cached = getFromCache<MatchesResponse>(CACHE_KEY_MATCHES(videogame));
  if (cached) return cached;

  if (!isSDKConfigured()) {
    return { live: [], upcoming: [], past: [] };
  }

  try {
    // Fetch all match types and tier 1 tournaments in parallel
    const [live, upcoming, past, sTierTournaments, aTierTournaments] = await Promise.all([
      getLiveMatches(videogame),
      getUpcomingMatches(videogame),
      getPastMatches(videogame),
      getTournamentsByTier('s', videogame),
      getTournamentsByTier('a', videogame),
    ]);

    // Get matches from S-tier and A-tier tournaments
    const tier1TournamentIds = [
      ...sTierTournaments.map(t => t.id),
      ...aTierTournaments.map(t => t.id),
    ];

    // Fetch Tier 1 tournament matches
    let tier1Matches: Match[] = [];
    if (tier1TournamentIds.length > 0) {
      const tier1MatchPromises = tier1TournamentIds.slice(0, 10).map(getMatchesForTournament);
      const results = await Promise.all(tier1MatchPromises);
      tier1Matches = results.flat();
    }

    // Add Tier 1 matches to past (deduplicated)
    const pastIds = new Set(past.map(m => m.id));
    const additionalTier1Past = tier1Matches.filter(m => 
      m.status === 'finished' && !pastIds.has(m.id)
    );
    const allPast = [...past, ...additionalTier1Past];

    // Separate and prioritize past matches by tier
    const tier1Past = allPast.filter(m => m.tier === 'Tier 1');
    const tier2Past = allPast.filter(m => m.tier === 'Tier 2');
    const otherPast = allPast.filter(m => m.tier !== 'Tier 1' && m.tier !== 'Tier 2');

    // Sort by date
    const sortByDate = (a: Match, b: Match) =>
      new Date(b.end_at || b.scheduled_at || 0).getTime() - 
      new Date(a.end_at || a.scheduled_at || 0).getTime();

    tier1Past.sort(sortByDate);
    tier2Past.sort(sortByDate);
    otherPast.sort(sortByDate);

    const prioritizedPast = [
      ...tier1Past.slice(0, 20),
      ...tier2Past.slice(0, 15),
      ...otherPast.slice(0, 15),
    ];

    // Same for upcoming
    const upcomingIds = new Set(upcoming.map(m => m.id));
    const additionalTier1Upcoming = tier1Matches.filter(m =>
      m.status === 'not_started' && !upcomingIds.has(m.id)
    );
    const allUpcoming = [...upcoming, ...additionalTier1Upcoming];

    const tier1Upcoming = allUpcoming.filter(m => m.tier === 'Tier 1');
    const tier2Upcoming = allUpcoming.filter(m => m.tier === 'Tier 2');
    const otherUpcoming = allUpcoming.filter(m => m.tier !== 'Tier 1' && m.tier !== 'Tier 2');

    const sortByScheduled = (a: Match, b: Match) =>
      new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime();

    tier1Upcoming.sort(sortByScheduled);
    tier2Upcoming.sort(sortByScheduled);
    otherUpcoming.sort(sortByScheduled);

    const prioritizedUpcoming = [
      ...tier1Upcoming.slice(0, 15),
      ...tier2Upcoming.slice(0, 10),
      ...otherUpcoming.slice(0, 5),
    ];

    const result: MatchesResponse = {
      live,
      upcoming: prioritizedUpcoming,
      past: prioritizedPast,
    };

    setInCache(CACHE_KEY_MATCHES(videogame), result, CACHE_TTL_DEFAULT);
    return result;
  } catch (error) {
    console.error('Failed to fetch all matches:', error);
    return { live: [], upcoming: [], past: [] };
  }
}

/**
 * Match Service object for convenience
 */
export const MatchService = {
  getLiveMatches,
  getUpcomingMatches,
  getPastMatches,
  getAllMatches,
  getTournamentsByTier,
  getMatchesForTournament,
};
