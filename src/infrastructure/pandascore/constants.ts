/**
 * Supported video games
 */
export type VideoGameSlug = 'cs-2' | 'valorant' | 'lol' | 'dota2' | 'codmw' | 'r6siege' | 'ow';

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
  dota2: {
    name: 'Dota 2',
    slug: 'dota2',
    logo: '/games/dota2.svg'
  },
  codmw: {
    name: 'Call of Duty',
    slug: 'codmw',
    logo: '/games/cod.svg'
  },
  r6siege: {
    name: 'Rainbow Six Siege',
    slug: 'r6siege',
    logo: '/games/r6.svg'
  },
  ow: {
    name: 'Overwatch',
    slug: 'ow',
    logo: '/games/overwatch.svg'
  },
};
