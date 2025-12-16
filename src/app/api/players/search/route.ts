import { NextRequest, NextResponse } from "next/server";
import { getCountryCode } from "@/utils";
import { pandaScoreSDK, isSDKConfigured, MOCK_PLAYERS } from "@/infrastructure/pandascore";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  if (!isSDKConfigured()) {
    // Return mock data filtered by query
    const lowerQuery = query.toLowerCase();
    const results = MOCK_PLAYERS.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      (p.first_name && p.first_name.toLowerCase().includes(lowerQuery)) ||
      (p.last_name && p.last_name.toLowerCase().includes(lowerQuery))
    );
    return NextResponse.json(results);
  }

  try {
    const response = await pandaScoreSDK.get_players({
      'search[name]': query,
      'filter[videogame]': 'csgo',
      'page[size]': '20',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (response.data as any[]).map((player) => ({
      id: player.id,
      slug: player.slug,
      name: player.name,
      first_name: player.first_name,
      last_name: player.last_name,
      nationality: getCountryCode(player.nationality),
      image_url: player.image_url,
      role: player.role,
      currentTeam: player.current_team ? {
        id: player.current_team.id,
        name: player.current_team.name,
        image_url: player.current_team.image_url,
      } : null,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching players:", error);
    return NextResponse.json(
      { error: "Failed to search players" },
      { status: 500 }
    );
  }
}