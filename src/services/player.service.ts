/**
 * Player Service
 * 
 * Business logic for player-related operations.
 */

import type { Player } from '@/types';
import {
  isSDKConfigured,
  getFromCache,
  setInCache,
  mapPlayer,
  getApiId,
} from '@/infrastructure/pandascore';
import { apiClient } from '../infrastructure/pandascore/ApiClient';
import type { VideoGameSlug } from '@/infrastructure/pandascore/gameSlugMapper';
import { getTopTeams } from './team.service';

const CACHE_KEY_PLAYER = (id: number) => `player-${id}`;
const CACHE_KEY_SEARCH = (game: string, query: string) => `player-search-${game}-${query.toLowerCase()}-v6`;

/**
 * Get player by ID
 */
export async function getPlayerById(playerId: number): Promise<Player | null> {
  const cached = getFromCache<Player>(CACHE_KEY_PLAYER(playerId));
  if (cached) return cached;

  if (!isSDKConfigured()) {
    return null;
  }

  try {
    const response = await apiClient.getPlayerById(playerId);
    // Handle single object vs array
    const playerRaw = Array.isArray(response.data) ? response.data[0] : response.data;
    
    const player = mapPlayer(playerRaw);
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
    // Use game-specific endpoint
    const response = await apiClient.getPlayers(videogame, {
      'search[name]': query,
      'page[size]': 50,
    });

    const validPlayers = response.data;
    const mappedPlayers: (Player & { currentTeam?: any })[] = validPlayers.map((p: any) => ({
      ...mapPlayer(p),
        currentTeam: p.current_team ? {
            id: p.current_team.id,
            name: p.current_team.name,
            image_url: p.current_team.image_url,
        } : null
    }));

    // HYBRID SEARCH FALLBACK
    if (mappedPlayers.length < 3) {
      try {
        const topTeams = await getTopTeams(videogame);
        const teamPlayers = topTeams.flatMap(t => t.players.map(p => ({
            ...p,
            currentTeam: { id: t.id, name: t.name, image_url: t.image_url }
        })));
        
        const fallbackMatches = teamPlayers.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        
        const existingIds = new Set(mappedPlayers.map(p => p.id));
        for (const p of fallbackMatches) {
          if (!existingIds.has(p.id)) {
            mappedPlayers.push(p);
            existingIds.add(p.id);
          }
        }
      } catch (err) {
        // Ignore fallback errors
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
