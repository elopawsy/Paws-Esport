/**
 * Environment configuration
 */

export const env = {
  PANDASCORE_API_KEY: process.env.PANDASCORE_API_KEY || '',
  
  get isApiKeyConfigured(): boolean {
    return Boolean(this.PANDASCORE_API_KEY);
  },
} as const;
