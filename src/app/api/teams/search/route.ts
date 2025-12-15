import { NextRequest, NextResponse } from "next/server";
import { isApiKeyConfigured } from "@/lib/pandascore";

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

export async function GET(request: NextRequest) {
    if (!isApiKeyConfigured()) {
        return NextResponse.json(
            { error: "PANDASCORE_API_KEY not configured" },
            { status: 503 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json(
            { error: "Query must be at least 2 characters" },
            { status: 400 }
        );
    }

    try {
        const apiKey = process.env.PANDASCORE_API_KEY!;

        // Search teams via PandaScore
        const url = new URL(`${PANDASCORE_BASE_URL}/csgo/teams`);
        url.searchParams.append("search[name]", query);
        url.searchParams.append("page[size]", "20");

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`PandaScore API error: ${response.status}`);
        }

        const teams = await response.json();

        // Transform to our format with players
        const results = teams.map((team: any) => ({
            id: team.id,
            name: team.name,
            logo: team.image_url || "/team-placeholder.svg",
            rank: 0, // Custom teams don't have a rank
            players: (team.players || []).map((player: any) => ({
                id: player.id,
                name: `${player.first_name || ""} ${player.last_name || ""}`.trim() || player.name,
                ign: player.name,
                image: player.image_url || "/player-placeholder.svg",
                country: {
                    name: player.nationality || "Unknown",
                    code: player.nationality?.slice(0, 2).toUpperCase() || "XX",
                },
            })),
        }));

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error searching teams:", error);
        return NextResponse.json(
            { error: "Failed to search teams" },
            { status: 500 }
        );
    }
}
