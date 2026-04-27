import { OddsService } from "@/services/odds.service";
import { calculateSimpleOdds, getOddsLabel } from "@/lib/odds";
import { NextResponse } from "next/server";
import type { VideoGameSlug } from "@/types/videogame";

/**
 * GET: Calculate odds for a match
 * 
 * Simple mode (backward compatible):
 *   /api/odds?tournamentTier=s&team1Wins=3&team2Wins=2
 * 
 * Advanced mode (with team IDs):
 *   /api/odds?team1Id=123&team2Id=456&videogame=cs-2&tournamentTier=s&matchFormat=3
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Check if using advanced mode (with team IDs)
        const team1Id = searchParams.get("team1Id");
        const team2Id = searchParams.get("team2Id");

        if (team1Id && team2Id) {
            // Advanced mode: fetch team data and calculate
            const videogame = (searchParams.get("videogame") || "cs-2") as VideoGameSlug;
            const tournamentTier = searchParams.get("tournamentTier");
            const matchFormat = parseInt(searchParams.get("matchFormat") || "3");
            const team1Name = searchParams.get("team1Name") || "Team 1";
            const team2Name = searchParams.get("team2Name") || "Team 2";

            const result = await OddsService.getOddsForMatch({
                matchId: 0, // Not used in calculation
                team1Id: parseInt(team1Id),
                team2Id: parseInt(team2Id),
                team1Name,
                team2Name,
                tournamentTier,
                matchFormat,
                videogame,
            });

            return NextResponse.json({
                team1Odds: result.team1Odds,
                team2Odds: result.team2Odds,
                team1Probability: Math.round(result.team1Probability * 100),
                team2Probability: Math.round(result.team2Probability * 100),
                team1Label: getOddsLabel(result.team1Odds),
                team2Label: getOddsLabel(result.team2Odds),
                confidence: result.confidence,
                factors: result.factors,
            });
        }

        // Simple mode (backward compatible)
        const tournamentTier = searchParams.get("tournamentTier");
        const team1Wins = parseInt(searchParams.get("team1Wins") || "0");
        const team2Wins = parseInt(searchParams.get("team2Wins") || "0");
        const matchFormat = parseInt(searchParams.get("matchFormat") || "3");

        const odds = calculateSimpleOdds(tournamentTier, team1Wins, team2Wins, matchFormat);

        return NextResponse.json({
            team1Odds: odds.team1Odds,
            team2Odds: odds.team2Odds,
            team1Label: getOddsLabel(odds.team1Odds),
            team2Label: getOddsLabel(odds.team2Odds),
        });
    } catch (error) {
        console.error("Error calculating odds:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
