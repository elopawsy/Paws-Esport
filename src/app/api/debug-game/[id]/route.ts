import { NextResponse } from "next/server";
import { apiClient } from "@/infrastructure/pandascore/ApiClient";
import { isSDKConfigured } from "@/infrastructure/pandascore/client";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const testId = parseInt(id, 10);

    if (!isSDKConfigured()) {
        return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    if (isNaN(testId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const results: Record<string, unknown> = { testId };

    // Test 1: Try game details endpoint (using game ID like 194601)
    try {
        const { data: gameDetail } = await apiClient.getGameById(testId);
        results.gameDetail = gameDetail;
        results.gameSuccess = true;
    } catch (err) {
        results.gameError = err instanceof Error ? err.message : String(err);
        results.gameSuccess = false;
    }

    // Test 2: Try match player stats (using match ID like 1269335)
    try {
        const { data: matchStats } = await apiClient.getMatchPlayersStats(testId);
        results.matchPlayerStats = matchStats;
        results.matchStatsSuccess = true;
    } catch (err) {
        results.matchStatsError = err instanceof Error ? err.message : String(err);
        results.matchStatsSuccess = false;
    }

    // Test 3: Try match games endpoint (using match ID like 1269335)
    try {
        const { data: matchGames } = await apiClient.getMatchGames(testId);
        results.matchGames = matchGames;
        results.matchGamesSuccess = true;
    } catch (err) {
        results.matchGamesError = err instanceof Error ? err.message : String(err);
        results.matchGamesSuccess = false;
    }

    return NextResponse.json(results);
}
