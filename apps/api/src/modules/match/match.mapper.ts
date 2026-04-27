import type { Match, MatchStatus, MatchTier } from './match.types';

interface RawTeam {
  id: number;
  name: string;
  acronym: string | null;
  image_url: string | null;
}

interface RawOpponent {
  type: 'Team' | 'Player';
  opponent: RawTeam | null;
}

interface RawResult {
  team_id: number;
  score: number;
}

interface RawLeague {
  id: number;
  name: string;
  image_url: string | null;
}

interface RawSerie {
  id: number;
  name: string | null;
  full_name: string | null;
}

interface RawTournament {
  id: number;
  name: string;
  slug: string;
  tier: string | null;
}

interface RawStream {
  raw_url: string | null;
  embed_url: string | null;
  language: string | null;
  main: boolean;
}

export interface RawMatch {
  id: number;
  slug: string | null;
  name: string;
  status: MatchStatus;
  scheduled_at: string | null;
  begin_at: string | null;
  end_at: string | null;
  opponents: RawOpponent[];
  results: RawResult[];
  league: RawLeague | null;
  serie: RawSerie | null;
  tournament: RawTournament | null;
  streams_list: RawStream[] | null;
}

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

function classifyTier(raw: RawMatch): MatchTier {
  const direct = raw.tournament?.tier?.toLowerCase();
  if (direct === 's' || direct === 'a') return 'Tier 1';
  if (direct === 'b' || direct === 'c') return 'Tier 2';
  if (direct === 'd') return 'Other';

  const leagueName = raw.league?.name?.toLowerCase() ?? '';
  const serieName = raw.serie?.full_name?.toLowerCase() ?? raw.serie?.name?.toLowerCase() ?? '';
  const haystack = `${leagueName} ${serieName}`;

  if (TIER_1_KEYWORDS.some((k) => haystack.includes(k))) return 'Tier 1';
  if (TIER_2_KEYWORDS.some((k) => haystack.includes(k))) return 'Tier 2';
  if (haystack.includes('league') || haystack.includes('championship') || haystack.includes('cup') || haystack.includes('open')) {
    return 'Tier 2';
  }
  return 'Other';
}

export function toMatch(raw: RawMatch): Match {
  const primaryStream = raw.streams_list?.find((s) => s.main) ?? raw.streams_list?.[0];

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    status: raw.status,
    tier: classifyTier(raw),
    scheduledAt: raw.scheduled_at,
    beginAt: raw.begin_at,
    endAt: raw.end_at,
    opponents: raw.opponents.map((o) => ({
      type: o.type,
      team: o.opponent
        ? {
            id: o.opponent.id,
            name: o.opponent.name,
            acronym: o.opponent.acronym,
            imageUrl: o.opponent.image_url,
          }
        : null,
    })),
    results: raw.results.map((r) => ({ teamId: r.team_id, score: r.score })),
    league: raw.league
      ? { id: raw.league.id, name: raw.league.name, imageUrl: raw.league.image_url }
      : null,
    serie: raw.serie
      ? { id: raw.serie.id, name: raw.serie.name, fullName: raw.serie.full_name }
      : null,
    tournament: raw.tournament
      ? {
          id: raw.tournament.id,
          name: raw.tournament.name,
          slug: raw.tournament.slug,
          tier: raw.tournament.tier,
        }
      : null,
    streams: primaryStream
      ? [
          {
            url: primaryStream.raw_url ?? primaryStream.embed_url ?? '',
            embedUrl: primaryStream.embed_url,
            language: primaryStream.language,
          },
        ]
      : [],
  };
}
