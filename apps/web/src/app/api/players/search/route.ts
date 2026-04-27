import { NextRequest, NextResponse } from "next/server";
import { PANDASCORE_GAMES, VideoGameSlug } from "@/infrastructure/pandascore/gameSlugMapper";

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

// Helper to get API slug from app slug
function getApiSlug(appSlug: string): string {
  const game = PANDASCORE_GAMES[appSlug as VideoGameSlug];
  return game ? game.slug : appSlug;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const gameEncoded = searchParams.get("game");
  const apiKey = process.env.PANDASCORE_API_KEY;

  // Map "cs-2" to "csgo", etc.
  const game = gameEncoded ? getApiSlug(gameEncoded) : null;

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
    // Search players, optionally filtered by game
    const endpoint = game ? `/${game}/players` : `/players`;
    const res = await fetch(
      `${PANDASCORE_BASE_URL}${endpoint}?search[name]=${encodeURIComponent(query)}&page[size]=100`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    let players = await res.json();

    // Backup for short queries: Try exact slug match to ensure we find players like "iM"
    // who might be buried in "contains" results for "im"
    if (query.length <= 3) {
      try {
        const slugQuery = query.toLowerCase();
        const exactRes = await fetch(
          `${PANDASCORE_BASE_URL}${endpoint}?filter[slug]=${encodeURIComponent(slugQuery)}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/json",
            },
            next: { revalidate: 0 },
          }
        );
        if (exactRes.ok) {
          const exactPlayers = await exactRes.json();
          // Merge results, putting exact matches first
          const existingIds = new Set(players.map((p: any) => p.id));
          const newPlayers = exactPlayers.filter((p: any) => !existingIds.has(p.id));
          players = [...newPlayers, ...players];
        }
      } catch (err) {
        console.error("Backup search failed", err);
      }
    }

    const calculateAge = (birthday: string | null) => {
      if (!birthday) return null;
      const birthDate = new Date(birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

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
      age: calculateAge(player.birthday),
      current_team: player.current_team ? {
        id: player.current_team.id,
        name: player.current_team.name,
        image_url: player.current_team.image_url,
        location: player.current_team.location,
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