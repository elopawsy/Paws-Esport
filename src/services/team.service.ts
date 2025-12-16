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
  getApiSlug,
  getApiId,
} from '@/infrastructure/pandascore';
import type { VideoGameSlug } from '@/infrastructure/pandascore/constants';

const CACHE_KEY_TOP_TEAMS = (game: VideoGameSlug) => `${game}-top-teams-v8`;
const CACHE_KEY_TEAM = (id: number) => `team-${id}`;
const CACHE_KEY_SEARCH = (game: VideoGameSlug, query: string) => `${game}-search-${query.toLowerCase()}-v3`;

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
    const apiId = getApiId(videogame);
    
    // Fetch recent matches for this game to find active teams (matches endpoint reliably returns opponents)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiSlug = getApiSlug(videogame);
    
    // Fetch recent matches for this game to find active teams
    // Matches endpoint reliably returns opponents unlike tournament list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await pandaScoreSDK.get_matches({
      'filter[videogame]': apiSlug,
      'page[size]': '50', // Get last 50 matches
      sort: ['-begin_at'],
    });

    // Extract unique teams from matches
    const teamsMap = new Map<number, Team>();
    const matches = response.data as unknown[];

    matches.forEach((m: any) => {
      // Structure: m.opponents = [{ opponent: { id, name, ... }, type: "Team" }]
      if (m.opponents && Array.isArray(m.opponents)) {
        m.opponents.forEach((op: any) => {
           if (op.type === 'Team' && op.opponent) {
             const teamData = op.opponent;
             if (!teamsMap.has(teamData.id)) {
               // Map team requires current_videogame?
               // Opponent object might be partial.
               // Let's ensure it has minimal data.
               // We need to inject current_videogame manually if missing
               if (!teamData.current_videogame) {
                 // Use apiId which is available in scope (but we need to ensure it's defined?)
                 // getApiId(videogame) was called at start of func.
                 // But wait, I changed L40 to 'const apiSlug'. I need to keep 'const apiId' too?
                 // Or just use hardcoded 3 for CS2? No.
                 // I should restore `const apiId = getApiId(videogame)` at top of function!
                 teamData.current_videogame = { id: getApiId(videogame), slug: videogame, name: videogame }; 
               }
               teamsMap.set(teamData.id, mapTeam(teamData));
             }
           }
        });
      }
    });

    const teams = Array.from(teamsMap.values()).slice(0, 50); // Limit to 50 teams
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
export async function searchTeams(query: string, videogame: VideoGameSlug = 'cs-2'): Promise<Team[]> {
  // Check cache first
  const cached = getFromCache<Team[]>(CACHE_KEY_SEARCH(videogame, query));
  if (cached) return cached;

  // Search mock data if SDK not configured
  if (!isSDKConfigured()) {
    const lowerQuery = query.toLowerCase();
    return MOCK_TEAMS.filter(t => t.name.toLowerCase().includes(lowerQuery));
  }

  try {
    const apiId = getApiId(videogame);
    
    // Search globally first (API filtering by game doesn't work well on this endpoint)
    const response = await pandaScoreSDK.get_teams({
      'search[name]': query,
      'page[size]': '50',
    });

    // Filter by videogame and query on client side to ensure accuracy
    // API search might be fuzzy or return unrelated results if parameters are ignored
    const teams = (response.data as unknown[])
      .filter((t: any) => {
        // Filter by game
        if (!t.current_videogame || t.current_videogame.id !== apiId) return false;
        
        // Filter by name (case insensitive partial match)
        return t.name.toLowerCase().includes(query.toLowerCase());
      })
      .map(mapTeam);

    // HYBRID SEARCH STRATEGY:
    // If API search returns nothing (strict filtering killed bad matches or API found nothing),
    // Fallback to searching within "Top Teams" (recent tournaments).
    // This ensures major teams like FaZe are found even if API search is flaky.
    if (teams.length === 0) {
       // We use the cached getTopTeams function
       const topTeams = await getTopTeams(videogame);
       const fallbackMatches = topTeams.filter(t => 
         t.name.toLowerCase().includes(query.toLowerCase())
       );
       
       if (fallbackMatches.length > 0) {
         setInCache(CACHE_KEY_SEARCH(videogame, query), fallbackMatches);
         return fallbackMatches;
       }
    }

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
