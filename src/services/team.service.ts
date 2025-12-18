/**
 * Team Service
 * 
 * Business logic for team-related operations.
 */

import type { Team, Match } from '@/types';
import {
  isSDKConfigured,
  getFromCache,
  setInCache,
  mapTeam,
  mapMatch,
  MOCK_TEAMS,
  getApiId,
} from '@/infrastructure/pandascore';
import { apiClient } from '../infrastructure/pandascore/ApiClient';
import type { VideoGameSlug } from '@/infrastructure/pandascore/gameSlugMapper';

const CACHE_KEY_TOP_TEAMS = (game: VideoGameSlug) => `${game}-top-teams-v10`;
const CACHE_KEY_TEAM = (id: number) => `team-${id}-v2`;
const CACHE_KEY_SEARCH = (game: VideoGameSlug, query: string) => `${game}-search-${query.toLowerCase()}-v5`;

/**
 * Get top teams for a specific game
 */
export async function getTopTeams(videogame: VideoGameSlug = 'cs-2'): Promise<Team[]> {
  // Check cache first
  const cached = getFromCache<Team[]>(CACHE_KEY_TOP_TEAMS(videogame));
  if (cached) return cached;

  // Return mock data if SDK not configured
  if (!isSDKConfigured()) {
    console.warn('PANDASCORE_API_KEY not set. Using mock data.');
    return MOCK_TEAMS;
  }

  try {
    // 1. Fetch recent matches to find active team IDs
    // Filter by Tier S and A to get major teams
    const response = await apiClient.getMatches(videogame, {
      'page[size]': 100, // Fetch more to ensuring finding enough teams
      sort: '-begin_at',
      'filter[tournament.tier]': 's,a',
    });

    const matches = response.data;
    const activeTeamIds = new Set<number>();

    matches.forEach((m: any) => {
      if (m.opponents && Array.isArray(m.opponents)) {
        m.opponents.forEach((op: any) => {
          if (op.type === 'Team' && op.opponent && op.opponent.id) {
            activeTeamIds.add(op.opponent.id);
          }
        });
      }
    });

    // Take top 30 active teams to avoid too large URL/requests
    const teamIdsToFetch = Array.from(activeTeamIds).slice(0, 30);

    if (teamIdsToFetch.length === 0) return MOCK_TEAMS;

    // 2. Fetch full details for these teams (including players)
    // Using filter[id] to batch fetch
    const teamsResponse = await apiClient.getTeams(videogame, {
      'filter[id]': teamIdsToFetch.join(','),
      'page[size]': 100
    });

    const teamsData = teamsResponse.data;
    const teams = teamsData.map(mapTeam);

    setInCache(CACHE_KEY_TOP_TEAMS(videogame), teams);
    return teams;
  } catch (error) {
    console.error('Failed to fetch top teams:', error);
    return MOCK_TEAMS;
  }
}

/**
 * Get team by ID
 */
export async function getTeamById(teamId: number): Promise<Team | null> {
  const cached = getFromCache<Team>(CACHE_KEY_TEAM(teamId));
  if (cached) return cached;

  if (!isSDKConfigured()) {
    return MOCK_TEAMS.find(t => t.id === teamId) || null;
  }

  try {
    const response = await apiClient.getTeamById(teamId);
    // Handle single object vs array
    const teamRaw = Array.isArray(response.data) ? response.data[0] : response.data;

    const team = mapTeam(teamRaw);
    setInCache(CACHE_KEY_TEAM(teamId), team);
    return team;
  } catch (error) {
    console.error(`Failed to fetch team ${teamId}`, error);
    return MOCK_TEAMS.find(t => t.id === teamId) || null;
  }
}

/**
 * Search teams by name
 */
export async function searchTeams(query: string, videogame: VideoGameSlug = 'cs-2'): Promise<Team[]> {
  const cached = getFromCache<Team[]>(CACHE_KEY_SEARCH(videogame, query));
  if (cached) return cached;

  if (!isSDKConfigured()) {
    return MOCK_TEAMS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
  }

  try {
    // searchTeams now uses Game-Specific endpoint!
    // /csgo/teams?search[name]=query
    const response = await apiClient.getTeams(videogame, {
      'search[name]': query,
      'page[size]': 50,
    });

    const teams = response.data.map(mapTeam);
    setInCache(CACHE_KEY_SEARCH(videogame, query), teams);
    return teams;
  } catch (error) {
    console.error('Failed to search teams:', error);
    return [];
  }
}

/**
 * Get related teams by name (cross-game)
 */
export async function getRelatedTeams(name: string, currentId: number): Promise<Team[]> {
  const cacheKey = `related-teams-${currentId}-v1`;
  const cached = getFromCache<Team[]>(cacheKey);
  if (cached) return cached;

  if (!isSDKConfigured()) return [];

  try {
    const response = await apiClient.getGlobalTeams({
      'search[name]': name,
      'page[size]': 20
    });

    // Filter different games and not same ID
    const teams = response.data
      .filter((t: any) => t.id !== currentId && t.current_videogame)
      .map(mapTeam);

    setInCache(cacheKey, teams);
    return teams;
  } catch (error) {
    console.error('Failed to fetch related teams:', error);
    return [];
  }
}

/**
 * Get upcoming and past matches for a team
 */
export async function getTeamMatches(teamId: number): Promise<{ upcoming: Match[], past: Match[] }> {
  const cacheKey = `team-matches-${teamId}-v1`;
  const cached = getFromCache<{ upcoming: Match[], past: Match[] }>(cacheKey);
  if (cached) return cached;

  if (!isSDKConfigured()) return { upcoming: [], past: [] };

  try {
    const [upcomingRes, pastRes] = await Promise.all([
      apiClient.getTeamMatches(teamId, {
        'filter[status]': 'not_started',
        'sort': 'begin_at',
        'page[size]': 5
      }),
      apiClient.getTeamMatches(teamId, {
        'filter[status]': 'finished',
        'sort': '-begin_at',
        'page[size]': 10
      })
    ]);

    const result = {
      upcoming: upcomingRes.data.map(mapMatch),
      past: pastRes.data.map(mapMatch)
    };

    setInCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Failed to fetch team matches:', error);
    return { upcoming: [], past: [] };
  }
}

/**
 * Team Service Object
 * Exported for backward compatibility with older consumers.
 */
export const TeamService = {
  getTopTeams,
  getTeamById,
  searchTeams,
  getRelatedTeams,
  getTeamMatches,
};
