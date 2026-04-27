/**
 * Admin Bet Options API - Single Item Operations
 * 
 * PUT and DELETE operations for a specific bet option
 */

import { prisma } from "@/lib/db";
import { requireBetManager } from "@/lib/admin";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Get a single bet option
export async function GET(request: Request, { params }: RouteParams) {
    return requireBetManager(async () => {
        const { id } = await params;

        const betOption = await prisma.betOption.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!betOption) {
            return NextResponse.json({ error: "Pari non trouvé" }, { status: 404 });
        }

        return NextResponse.json({ betOption });
    });
}

// PUT: Update a bet option
export async function PUT(request: Request, { params }: RouteParams) {
    return requireBetManager(async () => {
        const { id } = await params;
        const body = await request.json();

        const {
            team1Odds,
            team2Odds,
            isActive,
            expiresAt,
        } = body;

        // Check if bet option exists
        const existing = await prisma.betOption.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Pari non trouvé" }, { status: 404 });
        }

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (team1Odds !== undefined) {
            const validated = parseFloat(team1Odds);
            if (validated < 1.01 || validated > 50) {
                return NextResponse.json({ error: "Cotes team1 invalides (1.01-50)" }, { status: 400 });
            }
            updateData.team1Odds = validated;
        }

        if (team2Odds !== undefined) {
            const validated = parseFloat(team2Odds);
            if (validated < 1.01 || validated > 50) {
                return NextResponse.json({ error: "Cotes team2 invalides (1.01-50)" }, { status: 400 });
            }
            updateData.team2Odds = validated;
        }

        if (typeof isActive === "boolean") {
            updateData.isActive = isActive;
        }

        if (expiresAt !== undefined) {
            updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
        }

        const betOption = await prisma.betOption.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, betOption });
    });
}

// DELETE: Delete a bet option
export async function DELETE(request: Request, { params }: RouteParams) {
    return requireBetManager(async () => {
        const { id } = await params;

        // Check if bet option exists
        const existing = await prisma.betOption.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Pari non trouvé" }, { status: 404 });
        }

        await prisma.betOption.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: "Pari supprimé" });
    });
}
