/**
 * Tournament DTOs exposed by the API.
 * Strictly a slim projection of PandaScore's tournament shape — domain
 * code and clients should never see PandaScore internals.
 */

export type TournamentStatus = 'running' | 'upcoming' | 'past';
export type TournamentTier = 's' | 'a' | 'b' | 'c' | 'd' | string;

export interface TournamentLeague {
  id: number;
  name: string;
  imageUrl: string | null;
}

export interface TournamentSerie {
  id: number;
  name: string | null;
  fullName: string | null;
}

export interface Tournament {
  id: number;
  slug: string;
  name: string;
  tier: TournamentTier | null;
  beginAt: string | null;
  endAt: string | null;
  prizepool: string | null;
  league: TournamentLeague | null;
  serie: TournamentSerie | null;
}

export interface TournamentBuckets {
  running: Tournament[];
  upcoming: Tournament[];
  past: Tournament[];
}
