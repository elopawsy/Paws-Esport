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
    const tournamentTier = match.tournament?.tier?.toLowerCase() || "";

    if (tournamentTier === "s") return "Tier 1";
    if (tournamentTier === "a") return "Tier 1";
    if (tournamentTier === "b") return "Tier 2";
    if (tournamentTier === "c") return "Tier 2";
    if (tournamentTier === "d") return "Tier 3";

    const leagueName = match.league?.name?.toLowerCase() || "";
    const serieName = match.serie?.full_name?.toLowerCase() || match.serie?.name?.toLowerCase() || "";
    const fullName = `${leagueName} ${serieName}`;

    for (const keyword of TIER_1_KEYWORDS) {
        if (fullName.includes(keyword)) return "Tier 1";
    }

    for (const keyword of TIER_2_KEYWORDS) {
        if (fullName.includes(keyword)) return "Tier 2";
    }

    if (fullName.includes("league") || fullName.includes("championship") || fullName.includes("cup") || fullName.includes("open")) {
        return "Tier 2";
    }

    return "Other";
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const apiKey = process.env.PANDASCORE_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "API key not configured" },
            { status: 500 }
        );
    }

    try {
        // Fetch match details
        const matchRes = await fetch(`${PANDASCORE_BASE_URL}/matches/${id}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
            next: { revalidate: 30, tags: [`match-${id}`] },
        });

        if (!matchRes.ok) {
            return NextResponse.json(
                { error: "Match not found" },
                { status: 404 }
            );
        }

        const match = await matchRes.json();

        // Fetch games (maps) for the match
        const gamesRes = await fetch(`${PANDASCORE_BASE_URL}/matches/${id}/games`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
            next: { revalidate: 30 },
        });

        let games = gamesRes.ok ? await gamesRes.json() : [];

        // Enrich games with details if player stats are missing
        if (games.length > 0) {
            games = await Promise.all(games.map(async (game: any) => {
                // If players array is missing or empty, try to fetch detailed game info
                if (!game.players || game.players.length === 0) {
                    try {
                        const gameDetailRes = await fetch(`${PANDASCORE_BASE_URL}/csgo/games/${game.id}`, {
                            headers: {
                                Authorization: `Bearer ${apiKey}`,
                                Accept: "application/json",
                            },
                            next: { revalidate: 300 }, // Cache longer for finished games
                        });

                        let detailedGame = {};
                        if (gameDetailRes.ok) {
                            detailedGame = await gameDetailRes.json();
                        }

                        // Try to fetch rounds
                        let rounds = [];
                        try {
                            const roundsRes = await fetch(`${PANDASCORE_BASE_URL}/csgo/games/${game.id}/rounds`, {
                                headers: {
                                    Authorization: `Bearer ${apiKey}`,
                                    Accept: "application/json",
                                },
                                next: { revalidate: 300 },
                            });
                            if (roundsRes.ok) {
                                rounds = await roundsRes.json();
                            }
                        } catch (e) {
                            console.warn(`Failed to fetch rounds for game ${game.id}`, e);
                        }

                        return { ...game, ...detailedGame, rounds };

                    } catch (e) {
                        console.warn(`Failed to fetch details for game ${game.id}`, e);
                    }
                }
                return game;
            }));
        }

        // Get team IDs for additional data
        const team1Id = match.opponents?.[0]?.opponent?.id;
        const team2Id = match.opponents?.[1]?.opponent?.id;

        // Fetch team rosters
        let team1Roster: any[] = [];
        let team2Roster: any[] = [];

        if (team1Id) {
            const team1Res = await fetch(`${PANDASCORE_BASE_URL}/teams/${team1Id}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Accept: "application/json",
                },
                next: { revalidate: 3600 },
            });
            if (team1Res.ok) {
                const team1Data = await team1Res.json();
                team1Roster = team1Data.players || [];
            }
        }

        if (team2Id) {
            const team2Res = await fetch(`${PANDASCORE_BASE_URL}/teams/${team2Id}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Accept: "application/json",
                },
                next: { revalidate: 3600 },
            });
            if (team2Res.ok) {
                const team2Data = await team2Res.json();
                team2Roster = team2Data.players || [];
            }
        }

        // Fetch head-to-head history (past matches between these two teams)
        let headToHead: any[] = [];
        if (team1Id && team2Id) {
            const h2hRes = await fetch(
                `${PANDASCORE_BASE_URL}/csgo/matches/past?filter[opponent_id]=${team1Id},${team2Id}&page[size]=10&sort=-scheduled_at`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        Accept: "application/json",
                    },
                    next: { revalidate: 300 },
                }
            );
            if (h2hRes.ok) {
                const h2hData = await h2hRes.json();
                // Filter to only include matches between these two specific teams
                headToHead = h2hData
                    .filter((m: any) => {
                        const opponentIds = m.opponents?.map((o: any) => o.opponent?.id) || [];
                        return opponentIds.includes(team1Id) && opponentIds.includes(team2Id);
                    })
                    .slice(0, 5)
                    .map((m: any) => ({
                        id: m.id,
                        name: m.name,
                        scheduled_at: m.scheduled_at,
                        winner_id: m.winner_id,
                        results: m.results,
                        league_name: m.league?.name,
                        serie_name: m.serie?.full_name || m.serie?.name,
                    }));
            }
        }

        // Fetch recent form for team 1 (last 5 matches)
        let team1RecentForm: any[] = [];
        if (team1Id) {
            const form1Res = await fetch(
                `${PANDASCORE_BASE_URL}/csgo/matches/past?filter[opponent_id]=${team1Id}&page[size]=5&sort=-scheduled_at`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        Accept: "application/json",
                    },
                    next: { revalidate: 300 },
                }
            );
            if (form1Res.ok) {
                const form1Data = await form1Res.json();
                team1RecentForm = form1Data.map((m: any) => ({
                    id: m.id,
                    opponent_name: m.opponents?.find((o: any) => o.opponent?.id !== team1Id)?.opponent?.name || "TBD",
                    opponent_logo: m.opponents?.find((o: any) => o.opponent?.id !== team1Id)?.opponent?.image_url,
                    scheduled_at: m.scheduled_at,
                    winner_id: m.winner_id,
                    won: m.winner_id === team1Id,
                    score: m.results?.find((r: any) => r.team_id === team1Id)?.score ?? 0,
                    opponent_score: m.results?.find((r: any) => r.team_id !== team1Id)?.score ?? 0,
                }));
            }
        }

        // Fetch recent form for team 2 (last 5 matches)
        let team2RecentForm: any[] = [];
        if (team2Id) {
            const form2Res = await fetch(
                `${PANDASCORE_BASE_URL}/csgo/matches/past?filter[opponent_id]=${team2Id}&page[size]=5&sort=-scheduled_at`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        Accept: "application/json",
                    },
                    next: { revalidate: 300 },
                }
            );
            if (form2Res.ok) {
                const form2Data = await form2Res.json();
                team2RecentForm = form2Data.map((m: any) => ({
                    id: m.id,
                    opponent_name: m.opponents?.find((o: any) => o.opponent?.id !== team2Id)?.opponent?.name || "TBD",
                    opponent_logo: m.opponents?.find((o: any) => o.opponent?.id !== team2Id)?.opponent?.image_url,
                    scheduled_at: m.scheduled_at,
                    winner_id: m.winner_id,
                    won: m.winner_id === team2Id,
                    score: m.results?.find((r: any) => r.team_id === team2Id)?.score ?? 0,
                    opponent_score: m.results?.find((r: any) => r.team_id !== team2Id)?.score ?? 0,
                }));
            }
        }

        // Fetch player statistics from games
        let playerStats: any[] = [];
        if (games.length > 0) {
            // Extract player stats from each game
            const allPlayerStats: {
                [playerId: number]: {
                    name: string,
                    team_id: number,
                    kills: number,
                    deaths: number,
                    assists: number,
                    headshots: number,
                    adr: number,
                    games_played: number
                }
            } = {};

            for (const game of games) {
                if (game.players) {
                    for (const player of game.players) {
                        const playerId = player.player?.id;
                        if (!playerId) continue;

                        if (!allPlayerStats[playerId]) {
                            allPlayerStats[playerId] = {
                                name: player.player?.name || "Unknown",
                                team_id: player.team?.id || 0,
                                kills: 0,
                                deaths: 0,
                                assists: 0,
                                headshots: 0,
                                adr: 0,
                                games_played: 0
                            };
                        }

                        allPlayerStats[playerId].kills += player.kills || 0;
                        allPlayerStats[playerId].deaths += player.deaths || 0;
                        allPlayerStats[playerId].assists += player.assists || 0;
                        allPlayerStats[playerId].headshots += player.headshots || 0;
                        allPlayerStats[playerId].adr += player.adr || 0;
                        allPlayerStats[playerId].games_played += 1;
                    }
                }
            }

            // Convert to array and calculate averages
            playerStats = Object.entries(allPlayerStats).map(([id, stats]) => ({
                player_id: parseInt(id),
                name: stats.name,
                team_id: stats.team_id,
                kills: stats.kills,
                deaths: stats.deaths,
                assists: stats.assists,
                headshots: stats.headshots,
                adr: stats.games_played > 0 ? Math.round(stats.adr / stats.games_played * 10) / 10 : 0,
                kd_ratio: stats.deaths > 0 ? Math.round((stats.kills / stats.deaths) * 100) / 100 : stats.kills,
                kda_ratio: stats.deaths > 0 ? Math.round(((stats.kills + stats.assists) / stats.deaths) * 100) / 100 : stats.kills + stats.assists,
                hs_percentage: stats.kills > 0 ? Math.round((stats.headshots / stats.kills) * 100) : 0,
                // Simple rating calculation (approximation of HLTV rating)
                rating: stats.games_played > 0 ? Math.round(
                    (0.2 * (stats.kills / stats.games_played / 20) +
                        0.2 * (1 - stats.deaths / stats.games_played / 20) +
                        0.15 * (stats.assists / stats.games_played / 10) +
                        0.15 * (stats.adr / stats.games_played / 80) +
                        0.3) * 100
                ) / 100 : 0
            }));
        }



        // Transform match data with additional details
        const transformedMatch = {
            id: match.id,
            name: match.name,
            status: match.status,
            scheduled_at: match.scheduled_at,
            begin_at: match.begin_at,
            end_at: match.end_at,
            number_of_games: match.number_of_games,
            match_type: match.match_type,
            detailed_stats: match.detailed_stats,
            draw: match.draw,
            forfeit: match.forfeit,
            rescheduled: match.rescheduled,
            winner_id: match.winner_id,
            opponents: match.opponents?.map((op: any) => ({
                type: op.type,
                opponent: {
                    id: op.opponent?.id,
                    name: op.opponent?.name,
                    acronym: op.opponent?.acronym,
                    location: op.opponent?.location,
                    image_url: op.opponent?.image_url,
                    players: op.opponent?.players || [],
                }
            })) || [],
            results: match.results || [],
            league: match.league ? {
                id: match.league.id,
                name: match.league.name,
                image_url: match.league.image_url,
                url: match.league.url,
            } : null,
            serie: match.serie ? {
                id: match.serie.id,
                name: match.serie.name,
                full_name: match.serie.full_name,
                year: match.serie.year,
                season: match.serie.season,
            } : null,
            tournament: match.tournament ? {
                id: match.tournament.id,
                name: match.tournament.name,
                tier: match.tournament.tier,
                type: match.tournament.type,
                prizepool: match.tournament.prizepool,
                country: match.tournament.country,
                region: match.tournament.region,
                begin_at: match.tournament.begin_at,
                end_at: match.tournament.end_at,
            } : null,
            tier: classifyTier(match),
            streams: match.streams_list?.map((stream: any) => ({
                main: stream.main,
                language: stream.language,
                raw_url: stream.raw_url,
                embed_url: stream.embed_url,
                official: stream.official,
            })) || [],
            games: games.map((game: any) => ({
                id: game.id,
                position: game.position,
                status: game.status,
                map: game.map?.name || null,
                length: game.length,
                winner_id: game.winner?.id,
                winner_name: game.winner?.name,
                teams: game.teams?.map((team: any) => ({
                    team_id: team.team?.id,
                    name: team.team?.name,
                    first_half_score: team.first_half_score,
                    second_half_score: team.second_half_score,
                    overtime_score: team.overtime_score,
                    total_score: (team.first_half_score || 0) + (team.second_half_score || 0) + (team.overtime_score || 0),
                })) || [],
                playerStats: game.players?.map((p: any) => ({
                    player_id: p.player?.id,
                    name: p.player?.name,
                    team_id: p.team?.id,
                    kills: p.kills ?? 0,
                    deaths: p.deaths ?? 0,
                    assists: p.assists ?? 0,
                    headshots: p.headshots ?? 0,
                    adr: p.adr ?? 0,
                    kd: p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills,
                    rating: p.rating ? p.rating.toFixed(2) : ((0.0073 * p.adr) + (0.3591 * (p.kills / (p.deaths > 0 ? p.deaths : 1))) + -0.5329).toFixed(2), // Simple approximation if missing
                })) || [],
                rounds: game.rounds || [], // Include rounds
            })),
            videogame: match.videogame,
            vetos: match.vetos || [], // Expose vetoes
            // Additional data
            team1Roster: team1Roster.map((p: any) => ({
                id: p.id,
                name: p.name,
                first_name: p.first_name,
                last_name: p.last_name,
                nationality: p.nationality,
                image_url: p.image_url,
                role: p.role,
                age: p.age,
            })),
            team2Roster: team2Roster.map((p: any) => ({
                id: p.id,
                name: p.name,
                first_name: p.first_name,
                last_name: p.last_name,
                nationality: p.nationality,
                image_url: p.image_url,
                role: p.role,
                age: p.age,
            })),
            headToHead,
            team1RecentForm,
            team2RecentForm,
            playerStats,
        };

        return NextResponse.json(transformedMatch);
    } catch (error) {
        console.error("Error fetching match details:", error);
        return NextResponse.json(
            { error: "Failed to fetch match details" },
            { status: 500 }
        );
    }
}
