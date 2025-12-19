import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: Get leaderboard data
export async function GET() {
    try {
        // Get all users with their bet statistics
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                coins: true,
                bets: {
                    select: {
                        status: true,
                        amount: true,
                        potentialWin: true,
                    },
                },
            },
        });

        // Calculate statistics for each user
        const leaderboardData = users.map((user) => {
            const totalBets = user.bets.length;
            const wonBets = user.bets.filter((b) => b.status === "WON").length;
            const lostBets = user.bets.filter((b) => b.status === "LOST").length;
            const finishedBets = wonBets + lostBets;
            const winRate = finishedBets > 0 ? (wonBets / finishedBets) * 100 : 0;

            // Calculate total earnings (sum of potentialWin for won bets)
            const totalEarnings = user.bets
                .filter((b) => b.status === "WON")
                .reduce((sum, b) => sum + b.potentialWin, 0);

            // Calculate total losses (sum of amounts for lost bets)
            const totalLosses = user.bets
                .filter((b) => b.status === "LOST")
                .reduce((sum, b) => sum + b.amount, 0);

            const netProfit = totalEarnings - totalLosses;

            return {
                id: user.id,
                name: user.name || user.email.split("@")[0],
                image: user.image,
                coins: user.coins,
                stats: {
                    totalBets,
                    wonBets,
                    lostBets,
                    winRate: Math.round(winRate * 10) / 10, // 1 decimal
                    totalEarnings,
                    netProfit,
                },
            };
        });

        // Sort for different leaderboards
        const byCoins = [...leaderboardData]
            .sort((a, b) => b.coins - a.coins)
            .slice(0, 50);

        const byWinRate = [...leaderboardData]
            .filter((u) => u.stats.totalBets >= 3) // Minimum 3 bets
            .sort((a, b) => b.stats.winRate - a.stats.winRate)
            .slice(0, 50);

        const byEarnings = [...leaderboardData]
            .sort((a, b) => b.stats.totalEarnings - a.stats.totalEarnings)
            .slice(0, 50);

        const byProfit = [...leaderboardData]
            .sort((a, b) => b.stats.netProfit - a.stats.netProfit)
            .slice(0, 50);

        return NextResponse.json({
            byCoins,
            byWinRate,
            byEarnings,
            byProfit,
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
