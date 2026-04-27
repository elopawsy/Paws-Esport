/**
 * PandaScore Infrastructure Barrel Export
 */

import { env } from '../config/env';

// SDK configuration check - defined here to avoid importing problematic SDK
export function isSDKConfigured(): boolean {
  return env.isApiKeyConfigured;
}


// Constants
export { VIDEO_GAMES } from './constants';
export type { VideoGameSlug } from './constants';

// Cache utilities
export { getFromCache, setInCache, clearCache, clearAllCache, CACHE_TTL } from './cache';

// Mock data
export { MOCK_TEAMS, TOP_TEAM_IDS } from './mock-data';
export { MOCK_PLAYERS } from './mock-players';
export type { MockPlayerWithTeam } from './mock-players';

// Mappers
export { mapTeam, mapPlayer, mapMatch, classifyTier, toTournamentTier } from './mappers';

// Game slug mapper
export { getApiSlug, getApiId, PANDASCORE_GAMES } from './gameSlugMapper';
export type { PandaScoreGame } from './gameSlugMapper';
