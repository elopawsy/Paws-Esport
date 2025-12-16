/**
 * Match Service
 * 
 * Business logic for match-related operations.
 */

import type { Match, MatchesResponse, TournamentTier } from '@/types';
import {
  isSDKConfigured,
  getFromCache,
  setInCache,
  mapMatch,
} from '@/infrastructure/pandascore';
import {
  getMatchTTL,
  CACHE_KEYS,
  CACHE_TTL,
  cachedFetch,
} from '@/infrastructure/pandascore/cache';
import { pandaScoreSDK } from '@/infrastructure/pandascore/client';
import { apiClient } from '../infrastructure/pandascore/ApiClient';
import type { VideoGameSlug } from '@/infrastructure/pandascore/gameSlugMapper';

const CACHE_KEY_MATCHES = (game: VideoGameSlug) => `${game}-matches-v3`;
const CACHE_TTL_DEFAULT = 5 * 60 * 1000; // 5 minutes

/**
 * Get live (running) matches
 */
export async function getLiveMatches(videogame: VideoGameSlug = 'cs-2'): Promise<Match[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const response = await apiClient.getMatches(videogame, {
      'filter[status]': 'running',
      'page[size]': '20',
    });

    return response.data.map(mapMatch);
  } catch (error) {
    console.error('Failed to fetch live matches:', error);
    return [];
  }
}

/**
 * Get upcoming matches
 */
export async function getUpcomingMatches(videogame: VideoGameSlug = 'cs-2'): Promise<Match[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const response = await apiClient.getMatches(videogame, {
      'filter[status]': 'not_started',
      'page[size]': '30',
      sort: 'scheduled_at',
    });

    return response.data.map(mapMatch);
  } catch (error) {
    console.error('Failed to fetch upcoming matches:', error);
    return [];
  }
}

/**
 * Get past matches
 */
export async function getPastMatches(videogame: VideoGameSlug = 'cs-2'): Promise<Match[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    // getMatches calls /<game>/matches.
    // filter[status]=finished
    const response = await apiClient.getMatches(videogame, {
      'filter[status]': 'finished',
      'page[size]': '50',
      sort: '-end_at',
    });

    return response.data.map(mapMatch);
  } catch (error) {
    console.error('Failed to fetch past matches:', error);
    return [];
  }
}

/**
 * Get tournaments by tier
 * (This function in MatchService returned { id: number }[] of tournaments?
 *  Why? For fetching matches by tournament tier?
 *  The original returned id-only objects using get_tournaments.
 *  Let's replicate.)
 */
export async function getTournamentsByTier(tier: TournamentTier, videogame: VideoGameSlug = 'cs-2'): Promise<{ id: number }[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    const response = await apiClient.getTournaments(videogame, {
      'filter[tier]': tier,
      'page[size]': '10',
      sort: '-begin_at',
    });

    return (response.data as { id: number }[]).map(t => ({ id: t.id }));
  } catch (error) {
    console.error(`Failed to fetch ${tier}-tier tournaments:`, error);
    return [];
  }
}

/**
 * Get matches for a specific tournament
 */
export async function getMatchesForTournament(tournamentId: number): Promise<Match[]> {
  if (!isSDKConfigured()) {
    return [];
  }

  try {
    // ApiClient does not have getMatchesForTournament helper. simple fetch is clean.
    // Use apiClient fetch directly or add method?
    // Let's us direct fetch via private `fetch` hack or create exposed method.
    // Actually, `apiClient` fetch is private.
    // I should add `getMatches(videogame, ...)` BUT I don't know the videogame here!
    // /tournaments/{id}/matches is generic.

    // I need `getMatchesForTournament` in ApiClient OR `fetch` exposed.
    // I'll assume I can add it to ApiClient or use cast.

    // To be clean: Add `getTournamentMatches` to ApiClient?
    // Or just use generic matches endpoint with `filter[tournament_id]=...`?
    // /matches?filter[tournament_id]=... works globally or game specific.
    // We don't have game slug here.
    // Global /matches endpoint?

    // Using `any` cast to access fetch for now as it's expedient (user wants "do it").
    // (apiClient as any).fetch(...)

    const response = await (apiClient as any).fetch(`/tournaments/${tournamentId}/matches`, {
      'page[size]': '30',
      sort: '-scheduled_at',
    });

    return response.data.map(mapMatch);
  } catch (error) {
    console.error(`Failed to fetch matches for tournament ${tournamentId}:`, error);
    return [];
  }
}

/**
 * Get all categorized matches (live, upcoming, past) with tier prioritization
 */
export async function getAllMatches(videogame: VideoGameSlug = 'cs-2'): Promise<MatchesResponse> {
  // Check cache first
  const cached = getFromCache<MatchesResponse>(CACHE_KEY_MATCHES(videogame));
  if (cached) return cached;

  if (!isSDKConfigured()) {
    return { live: [], upcoming: [], past: [] };
  }

  try {
    // Fetch all match types and tier 1 tournaments in parallel
    const [live, upcoming, past, sTierTournaments, aTierTournaments] = await Promise.all([
      getLiveMatches(videogame),
      getUpcomingMatches(videogame),
      getPastMatches(videogame),
      getTournamentsByTier('s', videogame),
      getTournamentsByTier('a', videogame),
    ]);

    // Get matches from S-tier and A-tier tournaments
    const tier1TournamentIds = [
      ...sTierTournaments.map(t => t.id),
      ...aTierTournaments.map(t => t.id),
    ];

    // Fetch Tier 1 tournament matches
    let tier1Matches: Match[] = [];
    if (tier1TournamentIds.length > 0) {
      const tier1MatchPromises = tier1TournamentIds.slice(0, 10).map(getMatchesForTournament);
      const results = await Promise.all(tier1MatchPromises);
      tier1Matches = results.flat();
    }

    // Add Tier 1 matches to past (deduplicated)
    const pastIds = new Set(past.map(m => m.id));
    const additionalTier1Past = tier1Matches.filter(m =>
      m.status === 'finished' && !pastIds.has(m.id)
    );
    const allPast = [...past, ...additionalTier1Past];

    // Separate and prioritize past matches by tier
    const tier1Past = allPast.filter(m => m.tier === 'Tier 1');
    const tier2Past = allPast.filter(m => m.tier === 'Tier 2');
    const otherPast = allPast.filter(m => m.tier !== 'Tier 1' && m.tier !== 'Tier 2');

    // Sort by date
    const sortByDate = (a: Match, b: Match) =>
      new Date(b.end_at || b.scheduled_at || 0).getTime() -
      new Date(a.end_at || a.scheduled_at || 0).getTime();

    tier1Past.sort(sortByDate);
    tier2Past.sort(sortByDate);
    otherPast.sort(sortByDate);

    const prioritizedPast = [
      ...tier1Past.slice(0, 20),
      ...tier2Past.slice(0, 15),
      ...otherPast.slice(0, 15),
    ];

    // Same for upcoming
    const upcomingIds = new Set(upcoming.map(m => m.id));
    const additionalTier1Upcoming = tier1Matches.filter(m =>
      m.status === 'not_started' && !upcomingIds.has(m.id)
    );
    const allUpcoming = [...upcoming, ...additionalTier1Upcoming];

    const tier1Upcoming = allUpcoming.filter(m => m.tier === 'Tier 1');
    const tier2Upcoming = allUpcoming.filter(m => m.tier === 'Tier 2');
    const otherUpcoming = allUpcoming.filter(m => m.tier !== 'Tier 1' && m.tier !== 'Tier 2');

    const sortByScheduled = (a: Match, b: Match) =>
      new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime();

    tier1Upcoming.sort(sortByScheduled);
    tier2Upcoming.sort(sortByScheduled);
    otherUpcoming.sort(sortByScheduled);

    const prioritizedUpcoming = [
      ...tier1Upcoming.slice(0, 15),
      ...tier2Upcoming.slice(0, 10),
      ...otherUpcoming.slice(0, 5),
    ];

    const result: MatchesResponse = {
      live,
      upcoming: prioritizedUpcoming,
      past: prioritizedPast,
    };

    setInCache(CACHE_KEY_MATCHES(videogame), result, CACHE_TTL_DEFAULT);
    return result;
  } catch (error) {
    console.error('Failed to fetch all matches:', error);
    return { live: [], upcoming: [], past: [] };
  }
}

/**
 * Get detailed match information by ID
 */
export async function getMatchDetails(id: string): Promise<Record<string, unknown> | null> {
  if (!isSDKConfigured()) {
    throw new Error("API key not configured");
  }

  const apiKey = process.env.PANDASCORE_API_KEY!;
  const matchCacheKey = CACHE_KEYS.match(id);

  // 1. Fetch match details (with smart TTL based on status)
  let match = getFromCache<Record<string, unknown>>(matchCacheKey);

  if (!match) {
    try {
      const response = await pandaScoreSDK.get_matches_matchIdOrSlug({
        match_id_or_slug: id,
      });
      match = response.data as Record<string, unknown>;

      // Cache with appropriate TTL based on match status
      const ttl = getMatchTTL(match.status as string);
      setInCache(matchCacheKey, match, ttl);
    } catch (e) {
      console.error("Match not found:", e);
      return null;
    }
  }

  // Get team IDs
  const opponents = (match.opponents as Array<{ type: string; opponent: Record<string, unknown> }>) || [];
  const team1Id = opponents[0]?.opponent?.id as number | undefined;
  const team2Id = opponents[1]?.opponent?.id as number | undefined;
  const videogame = (match.videogame as Record<string, unknown>)?.slug || "csgo";

  // Helper for auth fetch
  async function fetchWithAuth(url: string, apiKey: string): Promise<unknown> {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    });
    if (!res.ok) return null;
    return res.json();
  }

  // 2. Fetch team rosters (cached 24 hours - players don't change often)
  const [team1Data, team2Data] = await Promise.all([
    team1Id
      ? cachedFetch(
        CACHE_KEYS.roster(team1Id),
        () => fetchWithAuth(`${apiClient['baseUrl' as keyof typeof apiClient] || 'https://api.pandascore.co'}/teams/${team1Id}`, apiKey),
        CACHE_TTL.ROSTER
      )
      : null,
    team2Id
      ? cachedFetch(
        CACHE_KEYS.roster(team2Id),
        () => fetchWithAuth(`${apiClient['baseUrl' as keyof typeof apiClient] || 'https://api.pandascore.co'}/teams/${team2Id}`, apiKey),
        CACHE_TTL.ROSTER
      )
      : null,
  ]);

  // 3. Fetch recent form (cached 30 minutes)
  const baseApiUrl = 'https://api.pandascore.co';

  const [team1Form, team2Form] = await Promise.all([
    team1Id
      ? cachedFetch(
        CACHE_KEYS.recentForm(team1Id),
        () => fetchWithAuth(
          `${baseApiUrl}/${videogame}/matches/past?filter[opponent_id]=${team1Id}&page[size]=5&sort=-scheduled_at`,
          apiKey
        ),
        CACHE_TTL.RECENT_FORM
      )
      : [],
    team2Id
      ? cachedFetch(
        CACHE_KEYS.recentForm(team2Id),
        () => fetchWithAuth(
          `${baseApiUrl}/${videogame}/matches/past?filter[opponent_id]=${team2Id}&page[size]=5&sort=-scheduled_at`,
          apiKey
        ),
        CACHE_TTL.RECENT_FORM
      )
      : [],
  ]);

  // 4. Fetch head-to-head (cached 1 hour)
  let headToHead: unknown[] = [];
  if (team1Id && team2Id) {
    const h2hData = await cachedFetch(
      CACHE_KEYS.h2h(team1Id, team2Id),
      () => fetchWithAuth(
        `${baseApiUrl}/${videogame}/matches/past?filter[opponent_id]=${team1Id},${team2Id}&page[size]=10&sort=-scheduled_at`,
        apiKey
      ),
      CACHE_TTL.HEAD_TO_HEAD
    );

    if (Array.isArray(h2hData)) {
      headToHead = h2hData
        .filter((m: Record<string, unknown>) => {
          const opIds = ((m.opponents as Array<{ opponent: { id: number } }>) || []).map((o) => o.opponent?.id);
          return opIds.includes(team1Id) && opIds.includes(team2Id);
        })
        .slice(0, 5)
        .map((m: Record<string, unknown>) => ({
          id: m.id,
          name: m.name,
          scheduled_at: m.scheduled_at,
          winner_id: m.winner_id,
          results: m.results,
          league_name: (m.league as Record<string, unknown>)?.name,
        }));
    }
  }

  // 5. Fetch detailed games from /csgo/matches/{id}/games endpoint
  let gamesWithStats: Record<string, unknown>[] = [];
  const matchId = parseInt(id, 10);

  if (!isNaN(matchId)) {
    try {
      const cacheKey = `match-games-${matchId}`;
      const cached = getFromCache<Record<string, unknown>[]>(cacheKey);

      if (cached) {
        gamesWithStats = cached;
      } else {
        const { data: matchGames } = await apiClient.getMatchGames(matchId);

        if (Array.isArray(matchGames) && matchGames.length > 0) {
          gamesWithStats = matchGames.map((game: Record<string, unknown>) => ({
            id: game.id,
            position: game.position,
            status: game.status,
            length: game.length,
            finished: game.finished,
            map: game.map || null,
            winner: game.winner || null,
            teams: ((game.teams as Array<Record<string, unknown>>) || []).map((t: Record<string, unknown>) => ({
              team_id: (t.team as Record<string, unknown>)?.id,
              team_name: (t.team as Record<string, unknown>)?.name,
              team_acronym: (t.team as Record<string, unknown>)?.acronym,
              score: t.score,
              first_half_score: t.first_half_score,
              second_half_score: t.second_half_score,
              overtime_score: t.overtime_score,
            })),
            players: ((game.players as Array<Record<string, unknown>>) || []).map((p: Record<string, unknown>) => ({
              player_id: (p.player as Record<string, unknown>)?.id,
              player_name: (p.player as Record<string, unknown>)?.name,
              player_image: (p.player as Record<string, unknown>)?.image_url,
              team_id: (p.team as Record<string, unknown>)?.id,
              team_name: (p.team as Record<string, unknown>)?.name,
              kills: p.kills,
              deaths: p.deaths,
              assists: p.assists,
              headshots: p.headshots,
              adr: p.adr,
              kast: p.kast,
              rating: p.rating,
            })),
          }));

          setInCache(cacheKey, gamesWithStats, CACHE_TTL.ROSTER);
        }
      }
    } catch (err) {
      console.error('Failed to fetch match games:', err);
      // Continue without game stats
    }
  }


  // Helper functions
  const formatRoster = (teamData: unknown) => {
    if (!teamData || typeof teamData !== 'object') return [];
    const data = teamData as Record<string, unknown>;
    if (!data.players) return [];
    return ((data.players as Array<Record<string, unknown>>) || []).map((p) => ({
      id: p.id,
      name: p.name,
      first_name: p.first_name,
      last_name: p.last_name,
      nationality: p.nationality,
      image_url: p.image_url,
      role: p.role,
      age: p.age,
      active: p.active,
    }));
  };

  const formatRecentForm = (matches: unknown, teamId: number) => {
    if (!Array.isArray(matches)) return [];
    return matches.slice(0, 5).map((m) => {
      const match = m as Record<string, unknown>;
      const opponents = (match.opponents as Array<{ opponent: Record<string, unknown> }>) || [];
      const opponent = opponents.find((o) => o.opponent?.id !== teamId)?.opponent;
      const results = (match.results as Array<{ team_id: number; score: number }>) || [];
      const myScore = results.find((r) => r.team_id === teamId)?.score ?? 0;
      const oppScore = results.find((r) => r.team_id !== teamId)?.score ?? 0;
      return {
        id: match.id,
        opponent_name: opponent?.name || "TBD",
        opponent_image: opponent?.image_url,
        scheduled_at: match.scheduled_at,
        won: match.winner_id === teamId,
        score: myScore,
        opponent_score: oppScore,
      };
    });
  };

  // Build response
  const transformedMatch = {
    id: match.id,
    name: match.name,
    slug: match.slug,
    status: match.status,
    scheduled_at: match.scheduled_at,
    begin_at: match.begin_at,
    end_at: match.end_at,
    number_of_games: match.number_of_games,
    match_type: match.match_type,
    forfeit: match.forfeit,
    draw: match.draw,
    winner_id: match.winner_id,

    opponents: opponents.map((op) => {
      const opponentData = op.opponent as Record<string, unknown>;
      const isTeam = op.type === 'Team'; // Check the type of the opponent entry itself

      return {
        type: op.type,
        opponent: {
          id: opponentData?.id,
          name: isTeam ? opponentData?.name : undefined,
          acronym: isTeam ? opponentData?.acronym : undefined,
          location: isTeam ? opponentData?.location : undefined,
          image_url: isTeam ? opponentData?.image_url : undefined,
          // Add other properties if needed, e.g., for players
          first_name: !isTeam ? opponentData?.first_name : undefined,
          last_name: !isTeam ? opponentData?.last_name : undefined,
        },
      };
    }),

    results: match.results || [],

    games: ((match.games as Array<Record<string, unknown>>) || []).map((game) => ({
      id: game.id,
      position: game.position,
      status: game.status,
      length: game.length,
      finished: game.finished,
      winner: game.winner,
    })),

    streams: ((match.streams_list as Array<Record<string, unknown>>) || []).map((stream) => ({
      main: stream.main,
      language: stream.language,
      raw_url: stream.raw_url,
      embed_url: stream.embed_url,
      official: stream.official,
    })),

    tournament: match.tournament
      ? {
        id: (match.tournament as Record<string, unknown>).id,
        name: (match.tournament as Record<string, unknown>).name,
        tier: (match.tournament as Record<string, unknown>).tier,
        prizepool: (match.tournament as Record<string, unknown>).prizepool,
      }
      : null,

    league: match.league
      ? {
        id: (match.league as Record<string, unknown>).id,
        name: (match.league as Record<string, unknown>).name,
        image_url: (match.league as Record<string, unknown>).image_url,
      }
      : null,

    serie: match.serie
      ? {
        id: (match.serie as Record<string, unknown>).id,
        name: (match.serie as Record<string, unknown>).name,
        full_name: (match.serie as Record<string, unknown>).full_name,
      }
      : null,

    videogame: match.videogame
      ? {
        name: (match.videogame as Record<string, unknown>).name,
        slug: (match.videogame as Record<string, unknown>).slug,
      }
      : null,

    // Enriched data (smartly cached)
    team1Roster: formatRoster(team1Data),
    team2Roster: formatRoster(team2Data),
    team1RecentForm: team1Id ? formatRecentForm(team1Form, team1Id) : [],
    team2RecentForm: team2Id ? formatRecentForm(team2Form, team2Id) : [],
    headToHead,
    gamesWithStats,
  };

  return transformedMatch;
}

/**
 * Match Service object for convenience
 */
export const MatchService = {
  getLiveMatches,
  getUpcomingMatches,
  getPastMatches,
  getAllMatches,
  getTournamentsByTier,
  getMatchesForTournament,
  getMatchDetails,
};
