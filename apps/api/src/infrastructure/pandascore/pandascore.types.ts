/**
 * Supported video games inside the application.
 * Mirrors the web client's VideoGameSlug — kept in sync manually
 * until we extract it into a shared package.
 */
export type VideoGameSlug = 'cs-2' | 'valorant' | 'lol';

interface PandaScoreGameMapping {
  id: number;
  slug: string;
  name: string;
}

/**
 * Map application slugs to PandaScore identifiers.
 * IDs come from PandaScore's GET /videogames endpoint and are stable;
 * slugs occasionally drift (e.g. CS2 is 'csgo' on PandaScore).
 */
export const PANDASCORE_GAMES: Record<VideoGameSlug, PandaScoreGameMapping> = {
  'cs-2': { id: 3, slug: 'csgo', name: 'Counter-Strike' },
  valorant: { id: 26, slug: 'valorant', name: 'Valorant' },
  lol: { id: 1, slug: 'lol', name: 'LoL' },
};

export function getPandaScoreSlug(slug: VideoGameSlug): string {
  return PANDASCORE_GAMES[slug].slug;
}

export type PandaScoreParams = Record<string, string | number | boolean | undefined | null>;
