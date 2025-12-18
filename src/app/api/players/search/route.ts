import { NextRequest, NextResponse } from "next/server";

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const apiKey = process.env.PANDASCORE_API_KEY;

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters long" },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Search players across ALL games using the global endpoint
    const res = await fetch(
      `${PANDASCORE_BASE_URL}/players?search[name]=${encodeURIComponent(query)}&page[size]=20`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const players = await res.json();

    // Transform players
    const transformedPlayers = players.map((player: any) => ({
      id: player.id,
      slug: player.slug,
      name: player.name,
      first_name: player.first_name,
      last_name: player.last_name,
      nationality: player.nationality,
      image_url: player.image_url,
      role: player.role,
      current_team: player.current_team ? {
        id: player.current_team.id,
        name: player.current_team.name,
        image_url: player.current_team.image_url,
      } : null,
      current_videogame: player.current_videogame,
    }));

    return NextResponse.json(transformedPlayers);
  } catch (error) {
    console.error("Error searching players:", error);
    return NextResponse.json(
      { error: "Failed to search players" },
      { status: 500 }
    );
  }
}