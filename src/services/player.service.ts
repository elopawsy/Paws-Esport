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
} from '@/infrastructure/pandascore';

const CACHE_KEY_PLAYER = (id: number) => `cs2-player-${id}`;
const CACHE_KEY_PLAYERS = 'cs2-players';

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
 */
export async function searchPlayers(query: string): Promise<Player[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const response = await pandaScoreSDK.get_players({
      'search[name]': query,
      'filter[videogame]': 'csgo',
      'page[size]': '20',
    });

    return (response.data as unknown[]).map(mapPlayer);
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
