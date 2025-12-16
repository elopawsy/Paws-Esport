/**
 * Tournament type definitions
 */

import type { TeamBasic } from './team';
import type { Match, TournamentTier, League, Serie } from './match';

export interface TournamentFull {
  id: number;
  slug: string;
  name: string;
  tier: TournamentTier | null;
  begin_at: string | null;
  end_at: string | null;
  prizepool: string | null;
  league: League | null;
  serie: Serie | null;
  teams: TeamBasic[];
}

export interface TournamentWithMatches extends TournamentFull {
  matches: Match[];
}

export interface TournamentStanding {
  rank: number;
  team: TeamBasic;
  wins: number;
  losses: number;
  draws: number;
}

export interface TournamentBracket {
  id: number;
  name: string;
  type: 'single_elimination' | 'double_elimination' | 'group' | 'round_robin';
  matches: Match[];
}

export { TournamentTier };
