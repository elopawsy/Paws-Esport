import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY;
const PANDASCORE_BASE_URL = "https://api.pandascore.co";

// POST: Settle bets for finished matches
// This endpoint can be called via cron job or manually
export async function POST(request: Request) {
    try {
        // Security check for Vercel Cron
        const authHeader = request.headers.get("authorization");
        const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

        // Also accept query param for manual testing
        const { searchParams } = new URL(request.url);
        const apiSecret = searchParams.get("secret");
        const isManualAuth = apiSecret === process.env.CRON_SECRET || apiSecret === "manual";

        // In production, require proper auth (unless it's Vercel Cron which doesn't need secret)
        if (process.env.NODE_ENV === "production" && !isVercelCron && !isManualAuth) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Get all pending bets
        const pendingBets = await prisma.bet.findMany({
            where: { status: "PENDING" },
            include: { user: true },
        });

        if (pendingBets.length === 0) {
            return NextResponse.json({ message: "Aucun pari en attente", settled: 0 });
        }

        // Get unique match IDs
        const matchIds = [...new Set(pendingBets.map(bet => bet.matchId))];

        let settledCount = 0;
        const results: any[] = [];

        // Check each match
        for (const matchId of matchIds) {
            try {
                // Fetch match from PandaScore
                const res = await fetch(`${PANDASCORE_BASE_URL}/matches/${matchId}`, {
                    headers: {
                        "Authorization": `Bearer ${PANDASCORE_API_KEY}`,
                    },
                });

                if (!res.ok) {
                    console.error(`Failed to fetch match ${matchId}: ${res.status}`);
                    continue;
                }

                const match = await res.json();

                // Check if match is finished
                if (match.status !== "finished" || !match.winner_id) {
                    continue;
                }

                const winnerId = match.winner_id;

                // Find bets for this match
                const matchBets = pendingBets.filter(bet => bet.matchId === matchId);

                for (const bet of matchBets) {
                    const won = bet.teamId === winnerId;
                    const newStatus = won ? "WON" : "LOST";
                    const winnings = won ? Math.floor(bet.amount * bet.odds) : 0;

                    // Update bet status
                    await prisma.bet.update({
                        where: { id: bet.id },
                        data: { status: newStatus },
                    });

                    // Credit winnings if won
                    if (won) {
                        await prisma.user.update({
                            where: { id: bet.userId },
                            data: { coins: { increment: winnings } },
                        });
                    }

                    // Create notification
                    await prisma.notification.create({
                        data: {
                            userId: bet.userId,
                            type: won ? "BET_WON" : "BET_LOST",
                            title: won ? "🎉 Pari gagné !" : "😢 Pari perdu",
                            message: won
                                ? `Tu as gagné ${winnings.toLocaleString()} coins !`
                                : `Tu as perdu ${bet.amount.toLocaleString()} coins.`,
                            link: `/match/${matchId}`,
                        },
                    });

                    settledCount++;
                    results.push({
                        betId: bet.id,
                        matchId,
                        userId: bet.userId,
                        status: newStatus,
                        winnings: won ? winnings : 0,
                    });
                }
            } catch (error) {
                console.error(`Error processing match ${matchId}:`, error);
            }
        }

        return NextResponse.json({
            message: `${settledCount} paris réglés`,
            settled: settledCount,
            results,
        });
    } catch (error) {
        console.error("Error settling bets:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// GET: Get settlement status (for debugging)
export async function GET() {
    try {
        const pendingCount = await prisma.bet.count({
            where: { status: "PENDING" },
        });

        const recentSettled = await prisma.bet.findMany({
            where: {
                status: { in: ["WON", "LOST"] },
            },
            orderBy: { updatedAt: "desc" },
            take: 10,
            select: {
                id: true,
                matchId: true,
                status: true,
                amount: true,
                odds: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            pendingBets: pendingCount,
            recentSettled,
        });
    } catch (error) {
        console.error("Error getting settlement status:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
