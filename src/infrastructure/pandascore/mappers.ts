/**
 * Mappers for converting SDK types to App types
 */

import type { Team, Player, Match, Tier, MatchStatus, TournamentTier } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SDKTeam = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SDKPlayer = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SDKMatch = any;

/**
 * Map SDK player to App player type
 */
function calculateAge(birthday: string | null): number | null {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function mapPlayer(sdkPlayer: SDKPlayer): Player {
  return {
    id: sdkPlayer.id,
    slug: sdkPlayer.slug,
    name: sdkPlayer.name,
    first_name: sdkPlayer.first_name ?? null,
    last_name: sdkPlayer.last_name ?? null,
    nationality: sdkPlayer.nationality ?? null,
    image_url: sdkPlayer.image_url ?? null,
    role: sdkPlayer.role ?? null,
    age: calculateAge(sdkPlayer.birthday),
  };
}

/**
 * Map SDK team to App team type
 */
export function mapTeam(sdkTeam: SDKTeam): Team {
  return {
    id: sdkTeam.id,
    slug: sdkTeam.slug,
    name: sdkTeam.name,
    acronym: sdkTeam.acronym ?? null,
    image_url: sdkTeam.image_url ?? null,
    location: sdkTeam.location ?? null,
    players: (sdkTeam.players ?? []).map(mapPlayer),
    current_videogame: sdkTeam.current_videogame ? {
      id: sdkTeam.current_videogame.id,
      name: sdkTeam.current_videogame.name,
      slug: sdkTeam.current_videogame.slug,
    } : null,
  };
}

/**
 * Classify match tier based on tournament tier and keywords
 */
export function classifyTier(sdkMatch: SDKMatch): Tier {
  const tournamentTier = sdkMatch.tournament?.tier?.toLowerCase() || '';

  // Direct tier mapping from PandaScore
  if (tournamentTier === 's' || tournamentTier === 'a') return 'Tier 1';
  if (tournamentTier === 'b' || tournamentTier === 'c') return 'Tier 2';
  if (tournamentTier === 'd') return 'Other';

  // Fallback: check league/serie names for known tournaments
  const leagueName = sdkMatch.league?.name?.toLowerCase() || '';
  const serieName = sdkMatch.serie?.full_name?.toLowerCase() || sdkMatch.serie?.name?.toLowerCase() || '';
  const fullName = `${leagueName} ${serieName}`;

  const TIER_1_KEYWORDS = [
    'major', 'blast premier', 'iem', 'esl pro league', 'pgl',
    'intel extreme masters', 'esl one', 'world final', 'grand final',
    'katowice', 'cologne', 'pro tour',
  ];

  const TIER_2_KEYWORDS = [
    'esl challenger', 'cct', 'esea premier', 'elisa', 'thunderpick',
    'betboom', 'yalla', 'roobet', 'perfect world', 'skyesports',
    'flashpoint', 'pinnacle', 'gamers8',
  ];

  for (const keyword of TIER_1_KEYWORDS) {
    if (fullName.includes(keyword)) return 'Tier 1';
  }

  for (const keyword of TIER_2_KEYWORDS) {
    if (fullName.includes(keyword)) return 'Tier 2';
  }

  if (fullName.includes('league') || fullName.includes('championship') ||
    fullName.includes('cup') || fullName.includes('open')) {
    return 'Tier 2';
  }

  return 'Other';
}

/**
 * Map SDK match to App match type
 */
export function mapMatch(sdkMatch: SDKMatch): Match {
  return {
    id: sdkMatch.id,
    slug: sdkMatch.slug,
    name: sdkMatch.name,
    status: sdkMatch.status as MatchStatus,
    scheduled_at: sdkMatch.scheduled_at ?? null,
    begin_at: sdkMatch.begin_at ?? null,
    end_at: sdkMatch.end_at ?? null,
    opponents: sdkMatch.opponents ?? [],
    results: sdkMatch.results ?? [],
    league: sdkMatch.league ?? null,
    serie: sdkMatch.serie ?? null,
    tournament: sdkMatch.tournament ?? null,
    tier: classifyTier(sdkMatch),
    streams: sdkMatch.streams_list?.slice(0, 1) ?? [],
  };
}

/**
 * Convert tier string to TournamentTier type
 */
export function toTournamentTier(tier: string): TournamentTier {
  const normalized = tier.toLowerCase();
  if (['s', 'a', 'b', 'c', 'd'].includes(normalized)) {
    return normalized as TournamentTier;
  }
  return 'unranked';
}
