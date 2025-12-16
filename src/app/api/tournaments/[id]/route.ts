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
    const parsedId = parseInt(id, 10);
    const tournamentId = isNaN(parsedId) ? id : parsedId;

    const tournament = await TournamentService.getTournamentById(tournamentId);

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Fetch related tournaments (phases) if the tournament belongs to a series
    let phases: any[] = [];
    if (tournament.serie) {
      phases = await TournamentService.getSeriesTournaments(tournament.serie.id);
    }

    return NextResponse.json({ ...tournament, phases });
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournament" },
      { status: 500 }
    );
  }
}
