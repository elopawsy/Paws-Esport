import { NextRequest, NextResponse } from "next/server";
import { TeamService } from "@/services";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videogame: any = searchParams.get("videogame") || "cs-2";

  try {
    const teams = await TeamService.getTopTeams(videogame);
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching top teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch top teams" },
      { status: 500 }
    );
  }
}
