/**
 * Match Service
 * 
 * Business logic for match-related operations.
 */

import type { Match, MatchesResponse, TournamentTier } from '@/types';
import {
  isSDKConfigured,
  getFromCache,
  setInCache,
  mapMatch,
} from '@/infrastructure/pandascore';
import { apiClient } from '../infrastructure/pandascore/ApiClient';
import type { VideoGameSlug } from '@/infrastructure/pandascore/gameSlugMapper';

const CACHE_KEY_MATCHES = (game: VideoGameSlug) => `${game}-matches-v3`;
const CACHE_TTL_DEFAULT = 5 * 60 * 1000; // 5 minutes

/**
 * Get live (running) matches
 */
export async function getLiveMatches(videogame: VideoGameSlug = 'cs-2'): Promise<Match[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const response = await apiClient.getMatches(videogame, {
      'filter[status]': 'running',
      'page[size]': '20',
    });

    return response.data.map(mapMatch);
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
    const response = await apiClient.getMatches(videogame, {
      'filter[status]': 'not_started',
      'page[size]': '30',
      sort: 'scheduled_at',
    });

    return response.data.map(mapMatch);
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
    // getMatches calls /<game>/matches.
    // filter[status]=finished
    const response = await apiClient.getMatches(videogame, {
      'filter[status]': 'finished',
      'page[size]': '50',
      sort: '-end_at',
    });

    return response.data.map(mapMatch);
  } catch (error) {
    console.error('Failed to fetch past matches:', error);
    return [];
  }
}

/**
 * Get tournaments by tier
 * (This function in MatchService returned { id: number }[] of tournaments?
 *  Why? For fetching matches by tournament tier?
 *  The original returned id-only objects using get_tournaments.
 *  Let's replicate.)
 */
export async function getTournamentsByTier(tier: TournamentTier, videogame: VideoGameSlug = 'cs-2'): Promise<{ id: number }[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const response = await apiClient.getTournaments(videogame, {
      'filter[tier]': tier,
      'page[size]': '10',
      sort: '-begin_at',
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
    // ApiClient does not have getMatchesForTournament helper. simple fetch is clean.
    // Use apiClient fetch directly or add method?
    // Let's us direct fetch via private `fetch` hack or create exposed method.
    // Actually, `apiClient` fetch is private.
    // I should add `getMatches(videogame, ...)` BUT I don't know the videogame here!
    // /tournaments/{id}/matches is generic.
    
    // I need `getMatchesForTournament` in ApiClient OR `fetch` exposed.
    // I'll assume I can add it to ApiClient or use cast.
    
    // To be clean: Add `getTournamentMatches` to ApiClient?
    // Or just use generic matches endpoint with `filter[tournament_id]=...`?
    // /matches?filter[tournament_id]=... works globally or game specific.
    // We don't have game slug here.
    // Global /matches endpoint?
    
    // Using `any` cast to access fetch for now as it's expedient (user wants "do it").
    // (apiClient as any).fetch(...)
    
    const response = await (apiClient as any).fetch(`/tournaments/${tournamentId}/matches`, {
      'page[size]': '30',
      sort: '-scheduled_at',
    });

    return response.data.map(mapMatch);
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
