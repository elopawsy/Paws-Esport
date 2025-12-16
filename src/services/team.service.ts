/**
 * Team Service
 * 
 * Business logic for team-related operations.
 */

import type { Team } from '@/types';
import {
  isSDKConfigured,
  getFromCache,
  setInCache,
  mapTeam,
  MOCK_TEAMS,
  getApiId,
} from '@/infrastructure/pandascore';
import { apiClient } from '../infrastructure/pandascore/ApiClient';
import type { VideoGameSlug } from '@/infrastructure/pandascore/gameSlugMapper';

const CACHE_KEY_TOP_TEAMS = (game: VideoGameSlug) => `${game}-top-teams-v9`;
const CACHE_KEY_TEAM = (id: number) => `team-${id}`;
const CACHE_KEY_SEARCH = (game: VideoGameSlug, query: string) => `${game}-search-${query.toLowerCase()}-v4`;

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
    // Fetch recent matches for this game to find active teams
    // Using ApiClient directly hitting /<game>/matches
    const response = await apiClient.getMatches(videogame, {
      'page[size]': 50,
      sort: '-begin_at',
    });

    // Extract unique teams from matches
    const teamsMap = new Map<number, Team>();
    const matches = response.data;

    matches.forEach((m: any) => {
      if (m.opponents && Array.isArray(m.opponents)) {
        m.opponents.forEach((op: any) => {
           if (op.type === 'Team' && op.opponent) {
             const teamData = op.opponent;
             if (!teamsMap.has(teamData.id)) {
               // Inject current_videogame if missing
               if (!teamData.current_videogame) {
                 teamData.current_videogame = { id: getApiId(videogame), slug: videogame, name: videogame }; 
               }
               teamsMap.set(teamData.id, mapTeam(teamData));
             }
           }
        });
      }
    });

    const teams = Array.from(teamsMap.values()).slice(0, 50);
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
 * Team Service Object
 * Exported for backward compatibility with older consumers.
 */
export const TeamService = {
  getTopTeams,
  getTeamById,
  searchTeams,
};
