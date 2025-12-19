import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET: Get user's bets
export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status"); // PENDING, WON, LOST, CANCELED

        const bets = await prisma.bet.findMany({
            where: {
                userId: session.user.id,
                ...(status ? { status: status as "PENDING" | "WON" | "LOST" | "CANCELED" } : {}),
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ bets });
    } catch (error) {
        console.error("Error fetching bets:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// POST: Place a new bet
export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { matchId, teamId, amount } = await request.json();

        // Validate inputs
        if (!matchId || typeof matchId !== "number") {
            return NextResponse.json({ error: "matchId invalide" }, { status: 400 });
        }
        if (!teamId || typeof teamId !== "number") {
            return NextResponse.json({ error: "teamId invalide" }, { status: 400 });
        }
        if (!amount || typeof amount !== "number" || amount < 10) {
            return NextResponse.json({ error: "Mise minimum: 10 coins" }, { status: 400 });
        }
        if (amount > 10000) {
            return NextResponse.json({ error: "Mise maximum: 10,000 coins" }, { status: 400 });
        }

        // Get user's current coins
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { coins: true },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        if (user.coins < amount) {
            return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });
        }

        // Check if user already bet on this match
        const existingBet = await prisma.bet.findUnique({
            where: {
                userId_matchId: {
                    userId: session.user.id,
                    matchId,
                },
            },
        });

        if (existingBet) {
            return NextResponse.json({ error: "Tu as déjà parié sur ce match" }, { status: 400 });
        }

        // Default odds (can be made dynamic based on team rankings later)
        const odds = 2.0;
        const potentialWin = Math.floor(amount * odds);

        // Create bet and deduct coins in a transaction
        const [bet] = await prisma.$transaction([
            prisma.bet.create({
                data: {
                    userId: session.user.id,
                    matchId,
                    teamId,
                    amount,
                    odds,
                    potentialWin,
                    status: "PENDING",
                },
            }),
            prisma.user.update({
                where: { id: session.user.id },
                data: { coins: { decrement: amount } },
            }),
        ]);

        return NextResponse.json({
            success: true,
            bet,
            newBalance: user.coins - amount,
        });
    } catch (error) {
        console.error("Error placing bet:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
