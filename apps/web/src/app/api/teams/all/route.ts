import { NextResponse } from "next/server";
import { TeamService } from "@/services";

export async function GET() {
  try {
    const teams = await TeamService.getTopTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching all teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}