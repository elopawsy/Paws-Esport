
import { NextResponse } from "next/server";

const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY;
const PANDASCORE_BASE_URL = "https://api.pandascore.co";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!PANDASCORE_API_KEY) {
        return NextResponse.json({ error: "No API Key" }, { status: 500 });
    }

    const headers = {
        Authorization: `Bearer ${PANDASCORE_API_KEY}`,
        Accept: "application/json",
    };

    try {
        // Fetch Match
        const matchRes = await fetch(`${PANDASCORE_BASE_URL}/matches/${id}`, { headers });
        const match = matchRes.ok ? await matchRes.json() : { error: matchRes.statusText };

        let games = [];
        let firstGameRounds = null;
        let firstGameId = null;

        if (match.games && match.games.length > 0) {
            games = match.games;
            firstGameId = games[0].id;

            // Try fetching detailed game
            const gameRes = await fetch(`${PANDASCORE_BASE_URL}/csgo/games/${firstGameId}`, { headers });
            const gameDetails = gameRes.ok ? await gameRes.json() : { error: gameRes.statusText };


            // Try fetching rounds
            const roundsRes = await fetch(`${PANDASCORE_BASE_URL}/csgo/games/${firstGameId}/rounds`, { headers });
            firstGameRounds = roundsRes.ok ? await roundsRes.json() : { error: roundsRes.statusText, status: roundsRes.status };

            return NextResponse.json({
                matchVetos: match.vetos,
                firstGameId,
                gameDetailsPlayers: gameDetails.players ? gameDetails.players.length : "No players",
                firstGameRoundsCount: Array.isArray(firstGameRounds) ? firstGameRounds.length : "Not array",
                firstGameRoundsError: firstGameRounds.error,
                firstGameRoundsStatus: firstGameRounds.status
            });
        }

        return NextResponse.json({ matchVetos: match.vetos, gamesCount: match.games?.length });

    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
