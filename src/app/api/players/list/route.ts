import { NextRequest, NextResponse } from "next/server";
import { getCountryCode } from "@/utils";
import { pandaScoreSDK, isSDKConfigured, MOCK_PLAYERS } from "@/infrastructure/pandascore";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nationality = searchParams.get("nationality")?.toUpperCase();
  const teamSlug = searchParams.get("team")?.toLowerCase();
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 20;

  if (!isSDKConfigured()) {
    // Use mock data with filters
    let results = [...MOCK_PLAYERS];

    if (nationality && nationality !== "ALL") {
      results = results.filter(p => p.nationality === nationality);
    }

    if (teamSlug) {
      results = results.filter(p =>
        p.currentTeam?.name.toLowerCase().includes(teamSlug) ||
        p.currentTeam?.id?.toString() === teamSlug
      );
    }

    const start = (page - 1) * pageSize;
    const paged = results.slice(start, start + pageSize);

    return NextResponse.json({
      players: paged,
      total: results.length,
      page,
      pageSize,
    });
  }

  try {
    const response = await pandaScoreSDK.get_players({
      'filter[videogame]': 'csgo',
      'page[size]': String(pageSize),
      'page[number]': String(page),
      ...(nationality && nationality !== "ALL" ? { 'filter[nationality]': nationality } : {}),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let results = (response.data as any[]).map((player) => ({
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

    // Client-side team filter
    if (teamSlug) {
      results = results.filter((p) =>
        p.currentTeam?.name.toLowerCase().includes(teamSlug)
      );
    }

    return NextResponse.json({
      players: results,
      total: results.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error listing players:", error);
    return NextResponse.json(
      { error: "Failed to list players" },
      { status: 500 }
    );
  }
}
