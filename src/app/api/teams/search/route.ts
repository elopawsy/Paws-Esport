import { NextRequest, NextResponse } from "next/server";

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const apiKey = process.env.PANDASCORE_API_KEY;

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
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
    // Search teams across ALL games using the global endpoint
    const res = await fetch(
      `${PANDASCORE_BASE_URL}/teams?search[name]=${encodeURIComponent(query)}&page[size]=20`,
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

    const teams = await res.json();

    // Transform teams
    const transformedTeams = teams.map((team: any) => ({
      id: team.id,
      slug: team.slug,
      name: team.name,
      acronym: team.acronym,
      image_url: team.image_url,
      location: team.location,
      current_videogame: team.current_videogame,
    }));

    return NextResponse.json(transformedTeams);
  } catch (error) {
    console.error("Error searching teams:", error);
    return NextResponse.json(
      { error: "Failed to search teams" },
      { status: 500 }
    );
  }
}