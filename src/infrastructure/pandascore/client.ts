/**
 * PandaScore SDK Client
 * 
 * Initializes and exports the SDK client singleton with authentication.
 */

import sdk from '@api/developers-pandascore';
import { env } from '../config/env';

/**
 * Supported video games
 */
export type VideoGameSlug = 'csgo' | 'valorant' | 'lol' | 'dota2' | 'codmw' | 'r6siege';

export const VIDEO_GAMES: Record<VideoGameSlug, { name: string; slug: VideoGameSlug }> = {
  csgo: { name: 'Counter-Strike 2', slug: 'csgo' },
  valorant: { name: 'Valorant', slug: 'valorant' },
  lol: { name: 'League of Legends', slug: 'lol' },
  dota2: { name: 'Dota 2', slug: 'dota2' },
  codmw: { name: 'Call of Duty', slug: 'codmw' },
  r6siege: { name: 'Rainbow Six Siege', slug: 'r6siege' },
};

// Initialize SDK with API key if available
if (env.isApiKeyConfigured) {
  sdk.auth(env.PANDASCORE_API_KEY);
}

/**
 * PandaScore SDK instance
 * Use this for all API calls to PandaScore
 */
export const pandaScoreSDK = sdk;

/**
 * Check if the SDK is properly configured with an API key
 */
export function isSDKConfigured(): boolean {
  return env.isApiKeyConfigured;
}

// Re-export types from the SDK
export type { FetchResponse } from 'api/dist/core';
