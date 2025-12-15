import { NextRequest, NextResponse } from "next/server";
import { getCountryCode } from "@/lib/pandascore";

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

// MOCK RESULTS for development without API Key
const MOCK_PLAYERS = [
    { id: 101, slug: "s1mple", name: "s1mple", first_name: "Oleksandr", last_name: "Kostyliev", nationality: "UA", image_url: null, role: "Sniper", currentTeam: null },
    { id: 102, slug: "niko", name: "NiKo", first_name: "Nikola", last_name: "Kovac", nationality: "BA", image_url: null, role: "Rifler", currentTeam: { id: 3210, name: "G2", image_url: null } },
    { id: 103, slug: "m0nesy", name: "m0NESY", first_name: "Ilya", last_name: "Osipov", nationality: "RU", image_url: null, role: "Sniper", currentTeam: { id: 3210, name: "G2", image_url: null } },
    { id: 104, slug: "dev1ce", name: "device", first_name: "Nicolai", last_name: "Reedtz", nationality: "DK", image_url: null, role: "Sniper", currentTeam: { id: 3213, name: "Astralis", image_url: null } },
    { id: 105, slug: "zywoo", name: "ZywOo", first_name: "Mathieu", last_name: "Herbaut", nationality: "FR", image_url: null, role: "Sniper", currentTeam: { id: 3455, name: "Vitality", image_url: null } },
];

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json(
            { error: "Query must be at least 2 characters" },
            { status: 400 }
        );
    }

    const apiKey = process.env.PANDASCORE_API_KEY;

    if (!apiKey) {
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
            slug: player.slug,
            name: player.name, // IGN
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