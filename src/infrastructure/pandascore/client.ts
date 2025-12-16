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
export { VIDEO_GAMES } from './constants';
export type { VideoGameSlug } from './constants';

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
