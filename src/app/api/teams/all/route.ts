import { NextResponse } from "next/server";
import { getTopCS2Teams } from "@/lib/pandascore";

export async function GET() {
    try {
        const teams = await getTopCS2Teams();
        return NextResponse.json(teams);
    } catch (error) {
        console.error("Error fetching all teams:", error);
        return NextResponse.json(
            { error: "Failed to fetch teams" },
            { status: 500 }
        );
    }
}