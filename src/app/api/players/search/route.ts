import { NextRequest, NextResponse } from "next/server";
import { searchPlayers } from "@/services/player.service";
import type { VideoGameSlug } from "@/infrastructure/pandascore";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const videogame = (searchParams.get("videogame") || "cs-2") as VideoGameSlug;

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters long" },
      { status: 400 }
    );
  }

  const results = await searchPlayers(query, videogame);
  return NextResponse.json(results);
}