/**
 * Video game types and constants
 * 
 * These are client-safe exports (no SDK dependency)
 */

export type VideoGameSlug = 'cs-2' | 'valorant' | 'lol';

export const VIDEO_GAMES: Record<VideoGameSlug, { name: string; slug: VideoGameSlug; logo: string }> = {
  'cs-2': {
    name: 'Counter-Strike 2',
    slug: 'cs-2',
    logo: '/games/cs2.svg'
  },
  valorant: {
    name: 'Valorant',
    slug: 'valorant',
    logo: '/games/valorant.svg'
  },
  lol: {
    name: 'League of Legends',
    slug: 'lol',
    logo: '/games/lol.svg'
  },
};

