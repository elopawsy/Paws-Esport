import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: Get leaderboard data
export async function GET() {
    try {
        const { auth } = await import("@/lib/auth");
        const { headers } = await import("next/headers");
        const session = await auth.api.getSession({
            headers: await headers()
        });
        const currentUserId = session?.user?.id;

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

        // Pre-fetch friendships if logged in
        const friendIds = new Set<string>();
        const pendingIds = new Set<string>(); // IDs where I sent request or received one

        if (currentUserId) {
            const friendships = await prisma.friendship.findMany({
                where: {
                    OR: [
                        { senderId: currentUserId },
                        { receiverId: currentUserId },
                    ],
                },
            });

            for (const f of friendships) {
                const otherId = f.senderId === currentUserId ? f.receiverId : f.senderId;
                if (f.status === "ACCEPTED") {
                    friendIds.add(otherId);
                } else if (f.status === "PENDING") {
                    pendingIds.add(otherId);
                }
            }
        }

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

            // Determine friendship status
            let friendshipStatus: "NONE" | "FRIEND" | "PENDING" | "SELF" = "NONE";
            if (currentUserId) {
                if (user.id === currentUserId) {
                    friendshipStatus = "SELF";
                } else if (friendIds.has(user.id)) {
                    friendshipStatus = "FRIEND";
                } else if (pendingIds.has(user.id)) {
                    friendshipStatus = "PENDING";
                }
            }

            return {
                id: user.id,
                name: user.name || user.email.split("@")[0],
                image: user.image,
                coins: user.coins,
                friendshipStatus,
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
