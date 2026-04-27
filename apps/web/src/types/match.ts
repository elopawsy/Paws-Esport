/**
 * Match type definitions
 */

import type { TeamBasic } from './team';

export type MatchStatus = 'not_started' | 'running' | 'finished' | 'canceled' | 'postponed';

export type Tier = 'Tier 1' | 'Tier 2' | 'Other';

export interface MatchOpponent {
  opponent: TeamBasic;
  type: 'Team';
}

export interface MatchResult {
  team_id: number;
  score: number;
}

export interface League {
  id: number;
  slug: string;
  name: string;
  image_url: string | null;
}

export interface Serie {
  id: number;
  slug: string;
  name: string | null;
  full_name: string | null;
  begin_at: string | null;
  end_at: string | null;
}

export interface Tournament {
  id: number;
  slug: string;
  name: string;
  tier: TournamentTier | null;
  begin_at: string | null;
  end_at: string | null;
}

export type TournamentTier = 's' | 'a' | 'b' | 'c' | 'd' | 'unranked';

export interface Stream {
  language: string;
  raw_url: string;
  embed_url: string | null;
  official: boolean;
  main: boolean;
}

export interface Match {
  id: number;
  slug: string;
  name: string;
  status: MatchStatus;
  scheduled_at: string | null;
  begin_at: string | null;
  end_at: string | null;
  opponents: MatchOpponent[];
  results: MatchResult[];
  league: League | null;
  serie: Serie | null;
  tournament: Tournament | null;
  tier: Tier;
  streams: Stream[];
}

export interface MatchesResponse {
  live: Match[];
  upcoming: Match[];
  past: Match[];
}
