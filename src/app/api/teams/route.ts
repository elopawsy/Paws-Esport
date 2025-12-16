import { NextRequest, NextResponse } from "next/server";
import { TeamService } from "@/services";
import type { VideoGameSlug } from "@/infrastructure/pandascore";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game = (searchParams.get("game") || "csgo") as VideoGameSlug;

  try {
    const teams = await TeamService.getTopTeams(game);
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}