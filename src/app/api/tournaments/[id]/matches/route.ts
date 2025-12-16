import { NextRequest, NextResponse } from "next/server";
import { TournamentService } from "@/services";
import { isSDKConfigured } from "@/infrastructure/pandascore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSDKConfigured()) {
    return NextResponse.json(
      { error: "PandaScore API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const tournamentId = parseInt(id, 10);

    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: "Invalid tournament ID" },
        { status: 400 }
      );
    }

    const matches = await TournamentService.getTournamentMatches(tournamentId);
    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching tournament matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournament matches" },
      { status: 500 }
    );
  }
}
