import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

/**
 * GET /api/user/tracked-teams
 * Get list of teams tracked by the current user
 */
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const trackedTeams = await prisma.trackedTeam.findMany({
            where: { userId: session.user.id },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        acronym: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(trackedTeams);
    } catch (error) {
        console.error("Error fetching tracked teams:", error);
        return NextResponse.json(
            { error: "Failed to fetch tracked teams" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/user/tracked-teams
 * Add a team to tracking
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { teamId, teamName, teamAcronym, teamImageUrl } = body;

        if (!teamId || !teamName) {
            return NextResponse.json(
                { error: "Team ID and name are required" },
                { status: 400 }
            );
        }

        // Ensure team exists in database (upsert)
        await prisma.team.upsert({
            where: { id: teamId },
            update: {
                name: teamName,
                acronym: teamAcronym,
                imageUrl: teamImageUrl,
            },
            create: {
                id: teamId,
                slug: `team-${teamId}`,
                name: teamName,
                acronym: teamAcronym,
                imageUrl: teamImageUrl,
            },
        });

        // Add to tracked teams
        const trackedTeam = await prisma.trackedTeam.create({
            data: {
                userId: session.user.id,
                teamId: teamId,
            },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        acronym: true,
                        imageUrl: true,
                    },
                },
            },
        });

        return NextResponse.json(trackedTeam, { status: 201 });
    } catch (error: any) {
        // Handle unique constraint violation (already tracking)
        if (error?.code === "P2002") {
            return NextResponse.json(
                { error: "You are already tracking this team" },
                { status: 409 }
            );
        }
        console.error("Error adding tracked team:", error);
        return NextResponse.json(
            { error: "Failed to add tracked team" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/user/tracked-teams
 * Remove a team from tracking
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get("teamId");

        if (!teamId) {
            return NextResponse.json(
                { error: "Team ID is required" },
                { status: 400 }
            );
        }

        await prisma.trackedTeam.delete({
            where: {
                userId_teamId: {
                    userId: session.user.id,
                    teamId: parseInt(teamId),
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing tracked team:", error);
        return NextResponse.json(
            { error: "Failed to remove tracked team" },
            { status: 500 }
        );
    }
}
