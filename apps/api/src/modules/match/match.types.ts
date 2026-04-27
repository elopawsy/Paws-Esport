/**
 * Match DTOs exposed by the API.
 * The shape stays close to what the web already consumes so the
 * frontend migration is mostly an import swap.
 */

export type MatchStatus = 'not_started' | 'running' | 'finished' | 'canceled' | 'postponed';
export type MatchTier = 'Tier 1' | 'Tier 2' | 'Other';

export interface MatchTeam {
  id: number;
  name: string;
  acronym: string | null;
  imageUrl: string | null;
}

export interface MatchOpponent {
  type: 'Team' | 'Player';
  team: MatchTeam | null;
}

export interface MatchResult {
  teamId: number;
  score: number;
}

export interface MatchLeague {
  id: number;
  name: string;
  imageUrl: string | null;
}

export interface MatchSerie {
  id: number;
  name: string | null;
  fullName: string | null;
}

export interface MatchTournament {
  id: number;
  name: string;
  slug: string;
  tier: string | null;
}

export interface MatchStream {
  url: string;
  language: string | null;
  embedUrl: string | null;
}

export interface ListMatchesQuery {
  game?: 'cs-2' | 'valorant' | 'lol';
  status?: MatchStatus;
  limit?: number;
}

export interface Match {
  id: number;
  slug: string | null;
  name: string;
  status: MatchStatus;
  tier: MatchTier;
  scheduledAt: string | null;
  beginAt: string | null;
  endAt: string | null;
  opponents: MatchOpponent[];
  results: MatchResult[];
  league: MatchLeague | null;
  serie: MatchSerie | null;
  tournament: MatchTournament | null;
  streams: MatchStream[];
}
