import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

/**
 * GET /api/user/favorite-players
 * Get list of favorite players for the current user
 */
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const favoritePlayers = await prisma.favoritePlayer.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(favoritePlayers);
    } catch (error) {
        console.error("Error fetching favorite players:", error);
        return NextResponse.json(
            { error: "Failed to fetch favorite players" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/user/favorite-players
 * Add a player to favorites
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
        const { playerId, playerSlug, playerName, playerImage, teamName } = body;

        if (!playerId || !playerName) {
            return NextResponse.json(
                { error: "Player ID and name are required" },
                { status: 400 }
            );
        }

        const favoritePlayer = await prisma.favoritePlayer.create({
            data: {
                userId: session.user.id,
                playerId: playerId,
                playerSlug: playerSlug || `player-${playerId}`,
                playerName: playerName,
                playerImage: playerImage,
                teamName: teamName,
            },
        });

        return NextResponse.json(favoritePlayer, { status: 201 });
    } catch (error: any) {
        // Handle unique constraint violation (already favorite)
        if (error?.code === "P2002") {
            return NextResponse.json(
                { error: "This player is already in your favorites" },
                { status: 409 }
            );
        }
        console.error("Error adding favorite player:", error);
        return NextResponse.json(
            { error: "Failed to add favorite player" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/user/favorite-players
 * Remove a player from favorites
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
        const playerId = searchParams.get("playerId");

        if (!playerId) {
            return NextResponse.json(
                { error: "Player ID is required" },
                { status: 400 }
            );
        }

        await prisma.favoritePlayer.delete({
            where: {
                userId_playerId: {
                    userId: session.user.id,
                    playerId: parseInt(playerId),
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing favorite player:", error);
        return NextResponse.json(
            { error: "Failed to remove favorite player" },
            { status: 500 }
        );
    }
}
