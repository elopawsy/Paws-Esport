import { NextRequest, NextResponse } from "next/server";
import { TournamentService } from "@/services";
import { isSDKConfigured } from "@/infrastructure/pandascore";
import type { VideoGameSlug } from "@/infrastructure/pandascore";

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

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournaments" },
      { status: 500 }
    );
  }
}
