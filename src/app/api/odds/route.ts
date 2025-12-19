import { calculateOdds } from "@/lib/odds";
import { NextResponse } from "next/server";

// GET: Calculate odds for a match
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const matchTier = searchParams.get("matchTier");
        const tournamentTier = searchParams.get("tournamentTier");
        const team1Wins = parseInt(searchParams.get("team1Wins") || "0");
        const team2Wins = parseInt(searchParams.get("team2Wins") || "0");

        const odds = calculateOdds(matchTier, tournamentTier, team1Wins, team2Wins);

        return NextResponse.json(odds);
    } catch (error) {
        console.error("Error calculating odds:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
