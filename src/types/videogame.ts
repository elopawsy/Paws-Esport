/**
 * Video game types and constants
 * 
 * These are client-safe exports (no SDK dependency)
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
