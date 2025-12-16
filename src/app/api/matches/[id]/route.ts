import { NextResponse } from "next/server";
import { pandaScoreSDK, isSDKConfigured } from "@/infrastructure/pandascore/client";
import {
  CACHE_TTL,
  CACHE_KEYS,
  cachedFetch,
  getMatchTTL,
  getFromCache,
  setInCache,
} from "@/infrastructure/pandascore/cache";

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

async function fetchWithAuth(url: string, apiKey: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSDKConfigured()) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const apiKey = process.env.PANDASCORE_API_KEY!;
  const matchCacheKey = CACHE_KEYS.match(id);

  try {
    // 1. Fetch match details (with smart TTL based on status)
    let match = getFromCache<Record<string, unknown>>(matchCacheKey);
    
    if (!match) {
      const response = await pandaScoreSDK.get_matches_matchIdOrSlug({
        match_id_or_slug: id,
      });
      match = response.data as Record<string, unknown>;
      
      // Cache with appropriate TTL based on match status
      const ttl = getMatchTTL(match.status as string);
      setInCache(matchCacheKey, match, ttl);
    }

    // Get team IDs
    const opponents = (match.opponents as Array<{ opponent: Record<string, unknown> }>) || [];
    const team1Id = opponents[0]?.opponent?.id as number | undefined;
    const team2Id = opponents[1]?.opponent?.id as number | undefined;
    const videogame = (match.videogame as Record<string, unknown>)?.slug || "csgo";

    // 2. Fetch team rosters (cached 24 hours - players don't change often)
    const [team1Data, team2Data] = await Promise.all([
      team1Id
        ? cachedFetch(
            CACHE_KEYS.roster(team1Id),
            () => fetchWithAuth(`${PANDASCORE_BASE_URL}/teams/${team1Id}`, apiKey),
            CACHE_TTL.ROSTER
          )
        : null,
      team2Id
        ? cachedFetch(
            CACHE_KEYS.roster(team2Id),
            () => fetchWithAuth(`${PANDASCORE_BASE_URL}/teams/${team2Id}`, apiKey),
            CACHE_TTL.ROSTER
          )
        : null,
    ]);

    // 3. Fetch recent form (cached 30 minutes)
    const [team1Form, team2Form] = await Promise.all([
      team1Id
        ? cachedFetch(
            CACHE_KEYS.recentForm(team1Id),
            () => fetchWithAuth(
              `${PANDASCORE_BASE_URL}/${videogame}/matches/past?filter[opponent_id]=${team1Id}&page[size]=5&sort=-scheduled_at`,
              apiKey
            ),
            CACHE_TTL.RECENT_FORM
          )
        : [],
      team2Id
        ? cachedFetch(
            CACHE_KEYS.recentForm(team2Id),
            () => fetchWithAuth(
              `${PANDASCORE_BASE_URL}/${videogame}/matches/past?filter[opponent_id]=${team2Id}&page[size]=5&sort=-scheduled_at`,
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
          `${PANDASCORE_BASE_URL}/${videogame}/matches/past?filter[opponent_id]=${team1Id},${team2Id}&page[size]=10&sort=-scheduled_at`,
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

      opponents: opponents.map((op) => ({
        type: op.type,
        opponent: {
          id: op.opponent?.id,
          name: op.opponent?.name,
          acronym: op.opponent?.acronym,
          location: op.opponent?.location,
          image_url: op.opponent?.image_url,
        },
      })),

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
    };

    return NextResponse.json(transformedMatch);
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
}
