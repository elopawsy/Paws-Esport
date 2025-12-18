import { NextRequest, NextResponse } from "next/server";
import { MatchService, getGlobalLiveMatches } from "@/services";
import { isSDKConfigured } from "@/infrastructure/pandascore";
import type { VideoGameSlug } from "@/infrastructure/pandascore";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameEncoded = searchParams.get("game");
  const status = searchParams.get("status");

  // If live matches requested without specific game (or game=all), fetch global
  if (status === 'running' && (!gameEncoded || gameEncoded === 'all')) {
    try {
      const matches = await getGlobalLiveMatches();
      return NextResponse.json({ live: matches });
    } catch (error) {
      console.error("Error fetching global live matches:", error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  }

  const game = (gameEncoded || "csgo") as VideoGameSlug;

  if (!isSDKConfigured()) {
    return NextResponse.json(
      { error: "PandaScore API key not configured. Please add PANDASCORE_API_KEY to your .env.local file." },
      { status: 500 }
    );
  }

  try {
    const matches = await MatchService.getAllMatches(game);
    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
