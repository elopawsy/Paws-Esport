/**
 * Team Service
 * 
 * Business logic for team-related operations.
 */

import type { Team } from '@/types';
import {
  pandaScoreSDK,
  isSDKConfigured,
  getFromCache,
  setInCache,
  mapTeam,
  MOCK_TEAMS,
  TOP_TEAM_IDS,
} from '@/infrastructure/pandascore';
import type { VideoGameSlug } from '@/infrastructure/pandascore';

const CACHE_KEY_TOP_TEAMS = (game: VideoGameSlug) => `${game}-top-teams-v5`;
const CACHE_KEY_TEAM = (id: number) => `team-${id}`;
const CACHE_KEY_SEARCH = (game: VideoGameSlug, query: string) => `${game}-search-${query.toLowerCase()}`;

/**
 * Get top teams for a specific game
 */
export async function getTopTeams(videogame: VideoGameSlug = 'csgo'): Promise<Team[]> {
  // Check cache first
  const cached = getFromCache<Team[]>(CACHE_KEY_TOP_TEAMS(videogame));
  if (cached) return cached;

  // Return mock data if SDK not configured
  if (!isSDKConfigured()) {
    console.warn('PANDASCORE_API_KEY not set. Using mock data.');
    return MOCK_TEAMS;
  }

  try {
    // For CS2, use known top team IDs
    const params = videogame === 'csgo'
      ? {
          'filter[id]': TOP_TEAM_IDS.join(','),
          'filter[videogame]': videogame,
          'page[size]': '50',
        }
      : {
          'filter[videogame]': videogame,
          'page[size]': '50',
        };

    const response = await pandaScoreSDK.get_teams(params);
    const teams = (response.data as unknown[]).map(mapTeam);

    // Sort teams by our ranking order for CS2
    const sortedTeams = videogame === 'csgo'
      ? teams.sort((a, b) => {
          const indexA = TOP_TEAM_IDS.indexOf(a.id);
          const indexB = TOP_TEAM_IDS.indexOf(b.id);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        })
      : teams;

    setInCache(CACHE_KEY_TOP_TEAMS(videogame), sortedTeams);
    return sortedTeams;
  } catch (error) {
    console.error('Failed to fetch from PandaScore, falling back to mock:', error);
    return MOCK_TEAMS;
  }
}

/**
 * Get team by ID
 */
export async function getTeamById(teamId: number): Promise<Team | null> {
  // Check cache first
  const cached = getFromCache<Team>(CACHE_KEY_TEAM(teamId));
  if (cached) return cached;

  // Check mock data if SDK not configured
  if (!isSDKConfigured()) {
    return MOCK_TEAMS.find(t => t.id === teamId) || null;
  }

  try {
    const response = await pandaScoreSDK.get_teams_teamIdOrSlug({
      team_id_or_slug: String(teamId),
    });

    const team = mapTeam(response.data);
    setInCache(CACHE_KEY_TEAM(teamId), team);
    return team;
  } catch (error) {
    console.error(`Failed to fetch team ${teamId}, fallback to mock search`, error);
    return MOCK_TEAMS.find(t => t.id === teamId) || null;
  }
}

/**
 * Search teams by name
 */
export async function searchTeams(query: string, videogame: VideoGameSlug = 'csgo'): Promise<Team[]> {
  // Check cache first
  const cached = getFromCache<Team[]>(CACHE_KEY_SEARCH(videogame, query));
  if (cached) return cached;

  // Search mock data if SDK not configured
  if (!isSDKConfigured()) {
    const lowerQuery = query.toLowerCase();
    return MOCK_TEAMS.filter(t => t.name.toLowerCase().includes(lowerQuery));
  }

  try {
    const response = await pandaScoreSDK.get_teams({
      'search[name]': query,
      'filter[videogame]': videogame,
      'page[size]': '20',
    });

    const teams = (response.data as unknown[]).map(mapTeam);
    setInCache(CACHE_KEY_SEARCH(videogame, query), teams);
    return teams;
  } catch (error) {
    console.error('Search failed, using mock', error);
    return MOCK_TEAMS.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * Team Service object for convenience
 */
export const TeamService = {
  getTopTeams,
  getTeamById,
  searchTeams,
};
