/**
 * Public API for Available Bets
 * 
 * Returns active bet options for display on homepage
 */

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: Get all active bet options (public)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const matchId = searchParams.get("matchId");
        const limit = parseInt(searchParams.get("limit") || "10");

        // If matchId is provided, return single bet option
        if (matchId) {
            const betOption = await prisma.betOption.findUnique({
                where: {
                    matchId: parseInt(matchId),
                    isActive: true,
                },
            });

            return NextResponse.json({ betOption });
        }

        // Otherwise return list of active bets
        const now = new Date();
        const betOptions = await prisma.betOption.findMany({
            where: {
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
            },
            orderBy: { scheduledAt: "asc" },
            take: limit,
        });

        return NextResponse.json({ betOptions });
    } catch (error) {
        console.error("Error fetching available bets:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
