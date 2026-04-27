import { NextResponse } from "next/server";

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const apiKey = process.env.PANDASCORE_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "API key not configured" },
            { status: 500 }
        );
    }

    if (!query) {
        return NextResponse.json(
            { error: "Query parameter 'q' is required" },
            { status: 400 }
        );
    }

    try {
        // Search across ALL games using the general endpoints
        const [matchesRes, tournamentsRes] = await Promise.all([
            // Search matches (all games)
            fetch(
                `${PANDASCORE_BASE_URL}/matches?search[name]=${encodeURIComponent(query)}&page[size]=15&sort=-scheduled_at`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        Accept: "application/json",
                    },
                    next: { revalidate: 60 },
                }
            ),
            // Search tournaments (all games)
            fetch(
                `${PANDASCORE_BASE_URL}/tournaments?search[name]=${encodeURIComponent(query)}&page[size]=15&sort=-begin_at`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        Accept: "application/json",
                    },
                    next: { revalidate: 3600 },
                }
            ),
        ]);

        const [matches, tournaments] = await Promise.all([
            matchesRes.ok ? matchesRes.json() : [],
            tournamentsRes.ok ? tournamentsRes.json() : [],
        ]);

        // Transform matches with videogame info
        const transformedMatches = matches.map((match: any) => ({
            id: match.id,
            name: match.name,
            status: match.status,
            scheduled_at: match.scheduled_at,
            opponents: match.opponents || [],
            results: match.results || [],
            league: match.league,
            serie: match.serie,
            tournament: match.tournament,
            videogame: match.videogame, // Include game info
        }));

        // Transform tournaments with videogame info
        const transformedTournaments = tournaments.map((t: any) => ({
            id: t.id,
            name: t.name,
            tier: t.tier,
            league: t.league,
            serie: t.serie,
            begin_at: t.begin_at,
            end_at: t.end_at,
            prizepool: t.prizepool,
            teams_count: t.teams ? t.teams.length : 0,
            videogame: t.videogame, // Include game info
        }));

        return NextResponse.json({
            matches: transformedMatches,
            tournaments: transformedTournaments,
        });

    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
