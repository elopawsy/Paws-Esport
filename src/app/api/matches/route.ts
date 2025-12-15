import { NextResponse } from "next/server";

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

// Tier classification keywords
const TIER_1_KEYWORDS = [
    "major", "blast premier", "iem", "esl pro league", "pgl",
    "intel extreme masters", "esl one", "rio major", "copenhagen major",
    "paris major", "antwerp major", "world final", "grand final",
    "katowice", "cologne", "pro tour"
];

const TIER_2_KEYWORDS = [
    "esl challenger", "cct", "esea premier", "elisa", "thunderpick",
    "betboom", "yalla", "roobet", "perfect world", "skyesports",
    "flashpoint", "pinnacle", "gamers8"
];

function classifyTier(match: any): string {
    // PandaScore provides tournament.tier directly as "s", "a", "b", "c", "d" or "unranked"
    const tournamentTier = match.tournament?.tier?.toLowerCase() || "";

    // Direct tier mapping from PandaScore
    if (tournamentTier === "s") return "Tier 1";
    if (tournamentTier === "a") return "Tier 1"; // A-tier is also considered top tier
    if (tournamentTier === "b") return "Tier 2";
    if (tournamentTier === "c") return "Tier 2";
    if (tournamentTier === "d") return "Tier 3";

    // Fallback: check league/serie names for known tournaments
    const leagueName = match.league?.name?.toLowerCase() || "";
    const serieName = match.serie?.full_name?.toLowerCase() || match.serie?.name?.toLowerCase() || "";
    const fullName = `${leagueName} ${serieName}`;

    // Tier 1 keywords
    for (const keyword of TIER_1_KEYWORDS) {
        if (fullName.includes(keyword)) return "Tier 1";
    }

    // Tier 2 keywords
    for (const keyword of TIER_2_KEYWORDS) {
        if (fullName.includes(keyword)) return "Tier 2";
    }

    // Default based on content
    if (fullName.includes("league") || fullName.includes("championship") || fullName.includes("cup") || fullName.includes("open")) {
        return "Tier 2";
    }

    return "Other";
}

export async function GET() {
    const apiKey = process.env.PANDASCORE_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "PandaScore API key not configured. Please add PANDASCORE_API_KEY to your .env.local file." },
            { status: 500 }
        );
    }

    try {
        // Fetch running (live) matches
        const liveRes = await fetch(`${PANDASCORE_BASE_URL}/csgo/matches/running?page[size]=20`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
            next: { revalidate: 30 },
        });

        // Fetch upcoming matches
        const upcomingRes = await fetch(`${PANDASCORE_BASE_URL}/csgo/matches/upcoming?page[size]=30&sort=scheduled_at`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
            next: { revalidate: 300 },
        });

        // Fetch recent past matches
        const pastRes = await fetch(`${PANDASCORE_BASE_URL}/csgo/matches/past?page[size]=50&sort=-end_at`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
            next: { revalidate: 300 },
        });

        // Fetch S-tier tournaments to get Tier 1 matches
        const sTierTournamentsRes = await fetch(`${PANDASCORE_BASE_URL}/csgo/tournaments?filter[tier]=s&page[size]=10&sort=-begin_at`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
            next: { revalidate: 3600 },
        });

        // Fetch A-tier tournaments
        const aTierTournamentsRes = await fetch(`${PANDASCORE_BASE_URL}/csgo/tournaments?filter[tier]=a&page[size]=10&sort=-begin_at`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
            next: { revalidate: 3600 },
        });

        const [liveData, upcomingData, pastData, sTierTournaments, aTierTournaments] = await Promise.all([
            liveRes.ok ? liveRes.json() : [],
            upcomingRes.ok ? upcomingRes.json() : [],
            pastRes.ok ? pastRes.json() : [],
            sTierTournamentsRes.ok ? sTierTournamentsRes.json() : [],
            aTierTournamentsRes.ok ? aTierTournamentsRes.json() : [],
        ]);

        // Get matches from S-tier and A-tier tournaments
        const tier1TournamentIds = [
            ...sTierTournaments.map((t: any) => t.id),
            ...aTierTournaments.map((t: any) => t.id)
        ];

        // Fetch matches from Tier 1 tournaments if we have any - prioritize these
        let tier1Matches: any[] = [];
        if (tier1TournamentIds.length > 0) {
            // Fetch from more tournaments (10) and more matches per tournament (30) for better Tier 1 coverage
            const tier1MatchPromises = tier1TournamentIds.slice(0, 10).map(async (tournamentId: number) => {
                const res = await fetch(`${PANDASCORE_BASE_URL}/csgo/tournaments/${tournamentId}/matches?page[size]=30&sort=-scheduled_at`, {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        Accept: "application/json",
                    },
                    next: { revalidate: 300 }, // More frequent updates for Tier 1
                });
                return res.ok ? res.json() : [];
            });
            const results = await Promise.all(tier1MatchPromises);
            tier1Matches = results.flat();
        }

        // Transform and classify matches
        const transformMatch = (match: any) => ({
            id: match.id,
            name: match.name,
            status: match.status,
            scheduled_at: match.scheduled_at,
            begin_at: match.begin_at,
            end_at: match.end_at,
            opponents: match.opponents || [],
            results: match.results || [],
            league: match.league,
            serie: match.serie,
            tournament: match.tournament,
            videogame: match.videogame,
            tier: classifyTier(match),
            streams: match.streams_list?.slice(0, 1) || [],
        });

        // Transform all matches
        const transformedLive = liveData.map(transformMatch);
        const transformedUpcoming = upcomingData.map(transformMatch);
        const transformedPast = pastData.map(transformMatch);
        const transformedTier1 = tier1Matches.map(transformMatch);

        // Add Tier 1 matches to past (deduplicated) and prioritize them
        const pastIds = new Set(transformedPast.map((m: any) => m.id));
        const additionalTier1Past = transformedTier1.filter((m: any) =>
            m.status === "finished" && !pastIds.has(m.id)
        );

        // Combine all past matches
        const allPast = [...transformedPast, ...additionalTier1Past];

        // Separate Tier 1 matches from others for priority display
        const tier1Past = allPast.filter((m: any) => m.tier === "Tier 1");
        const tier2Past = allPast.filter((m: any) => m.tier === "Tier 2");
        const otherPast = allPast.filter((m: any) => m.tier !== "Tier 1" && m.tier !== "Tier 2");

        // Sort each tier by date (most recent first)
        const sortByDate = (a: any, b: any) =>
            new Date(b.end_at || b.scheduled_at).getTime() - new Date(a.end_at || a.scheduled_at).getTime();

        tier1Past.sort(sortByDate);
        tier2Past.sort(sortByDate);
        otherPast.sort(sortByDate);

        // Prioritize: Tier 1 first (up to 20), then Tier 2 (up to 15), then others
        const prioritizedPast = [
            ...tier1Past.slice(0, 20),
            ...tier2Past.slice(0, 15),
            ...otherPast.slice(0, 15)
        ];

        // Also add Tier 1 upcoming matches with priority
        const upcomingIds = new Set(transformedUpcoming.map((m: any) => m.id));
        const additionalTier1Upcoming = transformedTier1.filter((m: any) =>
            m.status === "not_started" && !upcomingIds.has(m.id)
        );
        const allUpcoming = [...transformedUpcoming, ...additionalTier1Upcoming];

        // Separate and prioritize upcoming matches
        const tier1Upcoming = allUpcoming.filter((m: any) => m.tier === "Tier 1");
        const tier2Upcoming = allUpcoming.filter((m: any) => m.tier === "Tier 2");
        const otherUpcoming = allUpcoming.filter((m: any) => m.tier !== "Tier 1" && m.tier !== "Tier 2");

        // Sort by scheduled time (soonest first)
        const sortByScheduled = (a: any, b: any) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();

        tier1Upcoming.sort(sortByScheduled);
        tier2Upcoming.sort(sortByScheduled);
        otherUpcoming.sort(sortByScheduled);

        // Prioritize: Tier 1 first (up to 15), then Tier 2 (up to 10), then others
        const prioritizedUpcoming = [
            ...tier1Upcoming.slice(0, 15),
            ...tier2Upcoming.slice(0, 10),
            ...otherUpcoming.slice(0, 5)
        ];

        return NextResponse.json({
            live: transformedLive,
            upcoming: prioritizedUpcoming,
            past: prioritizedPast,
        });
    } catch (error) {
        console.error("Error fetching matches:", error);
        return NextResponse.json(
            { error: "Failed to fetch matches" },
            { status: 500 }
        );
    }
}
