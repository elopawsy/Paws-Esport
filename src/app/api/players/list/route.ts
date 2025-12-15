import { NextRequest, NextResponse } from "next/server";
import { getCountryCode } from "@/lib/pandascore";

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

// Extended mock players for development
const MOCK_PLAYERS = [
    { id: 101, slug: "s1mple", name: "s1mple", first_name: "Oleksandr", last_name: "Kostyliev", nationality: "UA", image_url: null, role: "Sniper", currentTeam: null },
    { id: 102, slug: "niko", name: "NiKo", first_name: "Nikola", last_name: "Kovac", nationality: "BA", image_url: null, role: "Rifler", currentTeam: { id: 3210, name: "G2", image_url: null } },
    { id: 103, slug: "m0nesy", name: "m0NESY", first_name: "Ilya", last_name: "Osipov", nationality: "RU", image_url: null, role: "Sniper", currentTeam: { id: 3210, name: "G2", image_url: null } },
    { id: 104, slug: "dev1ce", name: "device", first_name: "Nicolai", last_name: "Reedtz", nationality: "DK", image_url: null, role: "Sniper", currentTeam: { id: 3213, name: "Astralis", image_url: null } },
    { id: 105, slug: "zywoo", name: "ZywOo", first_name: "Mathieu", last_name: "Herbaut", nationality: "FR", image_url: null, role: "Sniper", currentTeam: { id: 3455, name: "Vitality", image_url: null } },
    { id: 106, slug: "apex", name: "apEX", first_name: "Dan", last_name: "Madesclaire", nationality: "FR", image_url: null, role: "IGL", currentTeam: { id: 3455, name: "Vitality", image_url: null } },
    { id: 107, slug: "xyp9x", name: "Xyp9x", first_name: "Andreas", last_name: "Højsleth", nationality: "DK", image_url: null, role: "Rifler", currentTeam: { id: 3213, name: "Astralis", image_url: null } },
    { id: 108, slug: "karrigan", name: "karrigan", first_name: "Finn", last_name: "Andersen", nationality: "DK", image_url: null, role: "IGL", currentTeam: { id: 3212, name: "FaZe", image_url: null } },
    { id: 109, slug: "twistzz", name: "Twistzz", first_name: "Russel", last_name: "Van Dulken", nationality: "CA", image_url: null, role: "Rifler", currentTeam: { id: 3212, name: "FaZe", image_url: null } },
    { id: 110, slug: "ropz", name: "ropz", first_name: "Robin", last_name: "Kool", nationality: "EE", image_url: null, role: "Rifler", currentTeam: { id: 3212, name: "FaZe", image_url: null } },
    { id: 111, slug: "electronic", name: "electronic", first_name: "Denis", last_name: "Sharipov", nationality: "RU", image_url: null, role: "Rifler", currentTeam: { id: 3216, name: "NaVi", image_url: null } },
    { id: 112, slug: "aleksib", name: "Aleksib", first_name: "Aleksi", last_name: "Virolainen", nationality: "FI", image_url: null, role: "IGL", currentTeam: { id: 3216, name: "NaVi", image_url: null } },
    { id: 113, slug: "b1t", name: "b1t", first_name: "Valerij", last_name: "Vakhovskij", nationality: "UA", image_url: null, role: "Rifler", currentTeam: { id: 3216, name: "NaVi", image_url: null } },
    { id: 114, slug: "donk", name: "donk", first_name: "Danil", last_name: "Kryshkovets", nationality: "RU", image_url: null, role: "Rifler", currentTeam: { id: 119369, name: "Spirit", image_url: null } },
    { id: 115, slug: "sh1ro", name: "sh1ro", first_name: "Dmitry", last_name: "Sokolov", nationality: "RU", image_url: null, role: "Sniper", currentTeam: { id: 119369, name: "Spirit", image_url: null } },
    { id: 116, slug: "frozen", name: "frozen", first_name: "David", last_name: "Čerňanský", nationality: "SK", image_url: null, role: "Rifler", currentTeam: { id: 3212, name: "FaZe", image_url: null } },
    { id: 117, slug: "broky", name: "broky", first_name: "Helvijs", last_name: "Saukants", nationality: "LV", image_url: null, role: "Sniper", currentTeam: { id: 3212, name: "FaZe", image_url: null } },
    { id: 118, slug: "nexa", name: "nexa", first_name: "Nemanja", last_name: "Isaković", nationality: "RS", image_url: null, role: "Rifler", currentTeam: null },
    { id: 119, slug: "flamez", name: "flameZ", first_name: "Shahar", last_name: "Shushan", nationality: "IL", image_url: null, role: "Rifler", currentTeam: { id: 3455, name: "Vitality", image_url: null } },
    { id: 120, slug: "spinx", name: "Spinx", first_name: "Lotan", last_name: "Giladi", nationality: "IL", image_url: null, role: "Rifler", currentTeam: { id: 3455, name: "Vitality", image_url: null } },
    { id: 121, slug: "brollan", name: "Brollan", first_name: "Ludvig", last_name: "Brolin", nationality: "SE", image_url: null, role: "Rifler", currentTeam: { id: 3240, name: "MOUZ", image_url: null } },
    { id: 122, slug: "siuhy", name: "siuhy", first_name: "Kamil", last_name: "Szkaradek", nationality: "PL", image_url: null, role: "IGL", currentTeam: { id: 3240, name: "MOUZ", image_url: null } },
    { id: 123, slug: "torzsi", name: "torzsi", first_name: "Ádám", last_name: "Torzsás", nationality: "HU", image_url: null, role: "Sniper", currentTeam: { id: 3240, name: "MOUZ", image_url: null } },
    { id: 124, slug: "jimpphat", name: "Jimpphat", first_name: "Jimi", last_name: "Salo", nationality: "FI", image_url: null, role: "Rifler", currentTeam: { id: 3240, name: "MOUZ", image_url: null } },
    { id: 125, slug: "xertioN", name: "xertioN", first_name: "Dorian", last_name: "Berman", nationality: "IL", image_url: null, role: "Rifler", currentTeam: { id: 3240, name: "MOUZ", image_url: null } },
];

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const nationality = searchParams.get("nationality")?.toUpperCase();
    const teamSlug = searchParams.get("team")?.toLowerCase();
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 20;

    const apiKey = process.env.PANDASCORE_API_KEY;

    if (!apiKey) {
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
        // Build PandaScore query
        const url = new URL(`${PANDASCORE_BASE_URL}/csgo/players`);
        url.searchParams.append("page[size]", pageSize.toString());
        url.searchParams.append("page[number]", page.toString());

        if (nationality && nationality !== "ALL") {
            url.searchParams.append("filter[nationality]", nationality);
        }

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`PandaScore API error: ${response.status}`);
        }

        const players = await response.json();

        // Transform to our format
        let results = players.map((player: any) => ({
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

        // Client-side team filter (PandaScore doesn't support this directly)
        if (teamSlug) {
            results = results.filter((p: any) =>
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
