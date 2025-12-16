import { NextResponse } from "next/server";
import { MatchService } from "@/services";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const match = await MatchService.getMatchDetails(id);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
