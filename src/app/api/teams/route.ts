import { NextResponse } from "next/server";
import { getHLTVTeams } from "@/lib/hltv-teams";

export async function GET() {
    try {
        const teams = getHLTVTeams();
        return NextResponse.json(teams);
    } catch (error) {
        console.error("Error fetching teams:", error);
        return NextResponse.json(
            { error: "Failed to fetch teams" },
            { status: 500 }
        );
    }
}
