import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET: Get user's bet for a specific match
export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ bet: null });
        }

        const { searchParams } = new URL(request.url);
        const matchId = searchParams.get("matchId");

        if (!matchId) {
            return NextResponse.json({ error: "matchId requis" }, { status: 400 });
        }

        const bet = await prisma.bet.findUnique({
            where: {
                userId_matchId: {
                    userId: session.user.id,
                    matchId: parseInt(matchId),
                },
            },
        });

        return NextResponse.json({ bet });
    } catch (error) {
        console.error("Error fetching bet:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
