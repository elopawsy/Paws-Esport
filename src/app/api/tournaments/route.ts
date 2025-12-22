import { NextRequest, NextResponse } from "next/server";
import { TournamentService } from "@/services";
import { isSDKConfigured } from "@/infrastructure/pandascore";
import type { VideoGameSlug } from "@/infrastructure/pandascore";

/**
 * Cache times in seconds based on data freshness needs
 */
const CACHE_TIMES = {
  running: { maxAge: 30, swr: 60 },      // Live - short cache
  upcoming: { maxAge: 300, swr: 600 },   // 5 min cache, 10 min stale
  past: { maxAge: 3600, swr: 7200 },     // 1 hour cache
  default: { maxAge: 300, swr: 600 },    // Default 5 min
} as const;

function getCacheHeaders(status: string | null) {
  const times = CACHE_TIMES[status as keyof typeof CACHE_TIMES] || CACHE_TIMES.default;
  return {
    'Cache-Control': `public, s-maxage=${times.maxAge}, stale-while-revalidate=${times.swr}`,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game = (searchParams.get("game") || "csgo") as VideoGameSlug;
  const status = searchParams.get("status"); // running, upcoming, past

  if (!isSDKConfigured()) {
    return NextResponse.json(
      { error: "PandaScore API key not configured" },
      { status: 500 }
    );
  }

  try {
    let tournaments;

    switch (status) {
      case "running":
        tournaments = await TournamentService.getRunningTournaments(game);
        break;
      case "upcoming":
        tournaments = await TournamentService.getUpcomingTournaments(game);
        break;
      case "past":
        tournaments = await TournamentService.getPastTournaments(game);
        break;
      default:
        // Return all categories
        tournaments = await TournamentService.getAllTournaments(game);
    }

    return NextResponse.json(tournaments, {
      headers: getCacheHeaders(status),
    });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournaments" },
      { status: 500 }
    );
  }
}
