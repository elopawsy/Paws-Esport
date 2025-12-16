import { NextRequest, NextResponse } from "next/server";
import { TeamService } from "@/services";
import type { VideoGameSlug } from "@/infrastructure/pandascore";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const videogame = (searchParams.get("videogame") || "cs-2") as VideoGameSlug;

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    const teams = await TeamService.searchTeams(query, videogame);
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error searching teams:", error);
    return NextResponse.json(
      { error: "Failed to search teams" },
      { status: 500 }
    );
  }
}