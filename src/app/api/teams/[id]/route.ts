import { NextRequest, NextResponse } from "next/server";
import { getCS2TeamById } from "@/lib/pandascore";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const teamId = parseInt(id, 10);

        if (isNaN(teamId)) {
            return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
        }

        const team = await getCS2TeamById(teamId);

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json(team);
    } catch (error) {
        console.error("Error fetching team:", error);
        return NextResponse.json(
            { error: "Failed to fetch team" },
            { status: 500 }
        );
    }
}