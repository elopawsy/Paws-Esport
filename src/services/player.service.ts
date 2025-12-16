/**
 * Player Service
 * 
 * Business logic for player-related operations.
 */

import type { Player } from '@/types';
import {
  pandaScoreSDK,
  isSDKConfigured,
  getFromCache,
  setInCache,
  mapPlayer,
  getApiSlug,
  getApiId,
} from '@/infrastructure/pandascore';
import type { VideoGameSlug } from '@/infrastructure/pandascore';
import { getTopTeams } from './team.service';

const CACHE_KEY_PLAYER = (id: number) => `player-${id}`;
const CACHE_KEY_SEARCH = (game: string, query: string) => `player-search-${game}-${query.toLowerCase()}-v4`;

/**
 * Get player by ID
 */
export async function getPlayerById(playerId: number): Promise<Player | null> {
  // Check cache first
  const cached = getFromCache<Player>(CACHE_KEY_PLAYER(playerId));
  if (cached) return cached;

  if (!isSDKConfigured()) {
    return null;
  }

  try {
    const response = await pandaScoreSDK.get_players_playerIdOrSlug({
      player_id_or_slug: String(playerId),
    });

    const player = mapPlayer(response.data);
    setInCache(CACHE_KEY_PLAYER(playerId), player);
    return player;
  } catch (error) {
    console.error(`Failed to fetch player ${playerId}:`, error);
    return null;
  }
}

/**
 * Search players by name
 * @param query - Search query string
 * @param videogame - Game to filter players by (defaults to 'cs-2')
 */
export async function searchPlayers(query: string, videogame: VideoGameSlug = 'cs-2'): Promise<(Player & { currentTeam?: any })[]> {
  const cached = getFromCache<(Player & { currentTeam?: any })[]>(CACHE_KEY_SEARCH(videogame, query));
  if (cached) return cached;

  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const apiId = getApiId(videogame);
    
    // Search globally first
    const response = await pandaScoreSDK.get_players({
      'search[name]': query,
      'page[size]': '50',
    });

    // Client-side filter by videogame ID (strict)
    const validPlayers = (response.data as unknown[]).filter((p: any) => {
       if (!p.current_videogame || p.current_videogame.id !== apiId) return false;
       return p.name.toLowerCase().includes(query.toLowerCase());
    });

    const mappedPlayers: (Player & { currentTeam?: any })[] = validPlayers.map((p: any) => ({
      ...mapPlayer(p),
        currentTeam: p.current_team ? {
            id: p.current_team.id,
            name: p.current_team.name,
            image_url: p.current_team.image_url,
        } : null
    }));

    // HYBRID SEARCH FALLBACK
    // If API search returns fewer than 3 results, try to find the player in the rosters of Top Teams.
    if (mappedPlayers.length < 3) {
      try {
        const topTeams = await getTopTeams(videogame);
        const teamPlayers = topTeams.flatMap(t => t.players.map(p => ({
            ...p,
            currentTeam: { id: t.id, name: t.name, image_url: t.image_url }
        })));
        
        const fallbackMatches = teamPlayers.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        
        // Dedupe
        const existingIds = new Set(mappedPlayers.map(p => p.id));
        for (const p of fallbackMatches) {
            if (!existingIds.has(p.id)) {
                mappedPlayers.push(p);
                existingIds.add(p.id);
            }
        }
      } catch (e) {
        console.warn('Hybrid player search fallback failed:', e);
      }
    }

    setInCache(CACHE_KEY_SEARCH(videogame, query), mappedPlayers);
    return mappedPlayers;
  } catch (error) {
    console.error('Failed to search players:', error);
    return [];
  }
}


/**
 * Player Service object for convenience
 */
export const PlayerService = {
  getPlayerById,
  searchPlayers,
};
