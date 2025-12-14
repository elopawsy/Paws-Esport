import { NextRequest, NextResponse } from "next/server";
import { searchCS2Teams, isApiKeyConfigured, PandaScorePlayer } from "@/lib/pandascore";

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

        // Search players via PandaScore
        const url = new URL(`${PANDASCORE_BASE_URL}/csgo/players`);
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

        const players = await response.json();

        // Transform to our format
        const results = players.map((player: any) => ({
            id: player.id,
            name: `${player.first_name || ""} ${player.last_name || ""}`.trim() || player.name,
            ign: player.name,
            image: player.image_url || "/player-placeholder.svg",
            country: {
                name: player.nationality || "Unknown",
                code: getCountryCode(player.nationality),
            },
            currentTeam: player.current_team ? {
                id: player.current_team.id,
                name: player.current_team.name,
                logo: player.current_team.image_url || "/team-placeholder.svg",
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

function getCountryCode(country: string | null): string {
    if (!country) return "XX";
    if (country.length === 2) return country.toUpperCase();

    const countryMap: Record<string, string> = {
        Russia: "RU", Russian: "RU",
        Ukraine: "UA", Ukrainian: "UA",
        France: "FR", French: "FR",
        Germany: "DE", German: "DE",
        Denmark: "DK", Danish: "DK",
        Sweden: "SE", Swedish: "SE",
        Poland: "PL", Polish: "PL",
        Brazil: "BR", Brazilian: "BR",
        "United States": "US", American: "US",
        Canada: "CA", Canadian: "CA",
        Finland: "FI", Finnish: "FI",
        Norway: "NO", Norwegian: "NO",
        Latvia: "LV", Estonia: "EE",
        Turkey: "TR", Turkish: "TR",
        Kazakhstan: "KZ", Mongolia: "MN",
        Portugal: "PT", Israel: "IL",
    };

    return countryMap[country] || country.slice(0, 2).toUpperCase();
}
