/**
 * Game Slug Mapper
 * 
 * Maps application game slugs to PandaScore API slugs and IDs.
 * Some games use different identifiers in the API than in our app.
 */

import type { VideoGameSlug } from './constants';

/**
 * PandaScore videogame data from API.
 * IDs are stable numeric identifiers that don't change.
 * Slugs may vary (e.g., CS2 can be 'cs-go', 'csgo', etc.)
 */
export interface PandaScoreGame {
  id: number;
  slug: string;
  name: string;
}

/**
 * Mapping from app game slugs to PandaScore API data.
 * IDs fetched from: GET /videogames
 */
export const PANDASCORE_GAMES: Record<VideoGameSlug, PandaScoreGame> = {
  'cs-2': { id: 3, slug: 'cs-go', name: 'Counter-Strike' },
  valorant: { id: 26, slug: 'valorant', name: 'Valorant' },
  lol: { id: 1, slug: 'league-of-legends', name: 'LoL' },
  dota2: { id: 4, slug: 'dota-2', name: 'Dota 2' },
  codmw: { id: 23, slug: 'cod-mw', name: 'Call of Duty' },
  r6siege: { id: 24, slug: 'r6-siege', name: 'Rainbow 6 Siege' },
};

/**
 * Convert an application game slug to the PandaScore API slug.
 * 
 * @param appSlug - The game slug used in the application
 * @returns The corresponding PandaScore API slug
 * 
 * @example
 * getApiSlug('cs-2') // returns 'cs-go'
 * getApiSlug('valorant') // returns 'valorant'
 */
export function getApiSlug(appSlug: VideoGameSlug): string {
  return PANDASCORE_GAMES[appSlug]?.slug || appSlug;
}

/**
 * Convert an application game slug to the PandaScore API numeric ID.
 * Using IDs is more reliable than slugs as they don't change.
 * 
 * @param appSlug - The game slug used in the application
 * @returns The corresponding PandaScore API numeric ID
 * 
 * @example
 * getApiId('cs-2') // returns 3
 * getApiId('valorant') // returns 26
 */
export function getApiId(appSlug: VideoGameSlug): number {
  return PANDASCORE_GAMES[appSlug]?.id;
}

