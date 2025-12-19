import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { teamId } = await request.json();

        if (typeof teamId !== "number") {
            return NextResponse.json({ error: "teamId invalide" }, { status: 400 });
        }

        // Verify team exists
        const team = await prisma.team.findUnique({
            where: { id: teamId },
        });

        if (!team) {
            return NextResponse.json({ error: "Équipe non trouvée" }, { status: 404 });
        }

        // Update user's favorite team
        await prisma.user.update({
            where: { id: session.user.id },
            data: { favoriteTeamId: teamId },
        });

        return NextResponse.json({ success: true, team });
    } catch (error) {
        console.error("Error updating favorite team:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
