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

        const { teamId, teamName, teamAcronym, teamImageUrl } = await request.json();

        if (typeof teamId !== "number") {
            return NextResponse.json({ error: "teamId invalide" }, { status: 400 });
        }

        // Try to find team, or create it if from PandaScore
        let team = await prisma.team.findUnique({
            where: { id: teamId },
        });

        // If team doesn't exist and we have team data (from PandaScore), create it
        if (!team && teamName) {
            // Generate slug from name
            const slug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            team = await prisma.team.create({
                data: {
                    id: teamId,
                    name: teamName,
                    slug: slug,
                    acronym: teamAcronym || null,
                    imageUrl: teamImageUrl || null,
                },
            });
        }

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
