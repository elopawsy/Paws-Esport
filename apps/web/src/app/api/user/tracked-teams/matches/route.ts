import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

/**
 * GET /api/user/tracked-teams/matches
 * Get upcoming matches for user's tracked teams
 */
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get tracked teams
        const trackedTeams = await prisma.trackedTeam.findMany({
            where: { userId: session.user.id },
            select: { teamId: true },
        });

        if (trackedTeams.length === 0) {
            return NextResponse.json([]);
        }

        const apiKey = process.env.PANDASCORE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        const teamIds = trackedTeams.map(t => t.teamId);

        // Fetch upcoming matches for each team (limit to avoid too many requests)
        const matchPromises = teamIds.slice(0, 10).map(async (teamId) => {
            try {
                const res = await fetch(
                    `${PANDASCORE_BASE_URL}/teams/${teamId}/matches?filter[status]=not_started&sort=begin_at&page[size]=5`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            Accept: "application/json",
                        },
                        next: { revalidate: 300 },
                    }
                );

                if (!res.ok) return [];
                return res.json();
            } catch {
                return [];
            }
        });

        const matchResults = await Promise.all(matchPromises);

        // Flatten and deduplicate matches
        const allMatches = matchResults.flat();
        const uniqueMatches = Array.from(
            new Map(allMatches.map((m: any) => [m.id, m])).values()
        );

        // Sort by begin_at and take first 10
        const sortedMatches = uniqueMatches
            .sort((a: any, b: any) => {
                const dateA = a.begin_at ? new Date(a.begin_at).getTime() : Infinity;
                const dateB = b.begin_at ? new Date(b.begin_at).getTime() : Infinity;
                return dateA - dateB;
            })
            .slice(0, 10);

        // Transform matches
        const transformedMatches = sortedMatches.map((match: any) => ({
            id: match.id,
            name: match.name,
            status: match.status,
            begin_at: match.begin_at,
            scheduled_at: match.scheduled_at,
            number_of_games: match.number_of_games,
            tournament: match.tournament ? {
                id: match.tournament.id,
                name: match.tournament.name,
            } : null,
            league: match.league ? {
                id: match.league.id,
                name: match.league.name,
                image_url: match.league.image_url,
            } : null,
            opponents: match.opponents?.map((opp: any) => ({
                type: opp.type,
                opponent: {
                    id: opp.opponent?.id,
                    name: opp.opponent?.name,
                    acronym: opp.opponent?.acronym,
                    image_url: opp.opponent?.image_url,
                },
            })) || [],
            videogame: match.videogame ? {
                id: match.videogame.id,
                name: match.videogame.name,
                slug: match.videogame.slug,
            } : null,
        }));

        return NextResponse.json(transformedMatches);
    } catch (error) {
        console.error("Error fetching tracked teams matches:", error);
        return NextResponse.json(
            { error: "Failed to fetch matches" },
            { status: 500 }
        );
    }
}
