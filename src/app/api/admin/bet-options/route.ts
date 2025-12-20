/**
 * Admin Bet Options API
 * 
 * CRUD operations for admin-created betting opportunities
 */

import { prisma } from "@/lib/db";
import { requireBetManager } from "@/lib/admin";
import { NextResponse } from "next/server";

// GET: List all bet options (with pagination)
export async function GET(request: Request) {
    return requireBetManager(async () => {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const activeOnly = searchParams.get("activeOnly") === "true";

        const where = activeOnly ? { isActive: true } : {};

        const [betOptions, total] = await Promise.all([
            prisma.betOption.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    createdBy: {
                        select: { id: true, name: true, email: true },
                    },
                },
            }),
            prisma.betOption.count({ where }),
        ]);

        return NextResponse.json({
            betOptions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    });
}

// POST: Create a new bet option
export async function POST(request: Request) {
    return requireBetManager(async (session) => {
        const body = await request.json();

        const {
            matchId,
            matchName,
            matchSlug,
            team1Id,
            team1Name,
            team1Logo,
            team1Odds,
            team2Id,
            team2Name,
            team2Logo,
            team2Odds,
            scheduledAt,
            expiresAt,
        } = body;

        // Validation
        if (!matchId || typeof matchId !== "number") {
            return NextResponse.json({ error: "matchId invalide" }, { status: 400 });
        }
        if (!matchName || typeof matchName !== "string") {
            return NextResponse.json({ error: "matchName requis" }, { status: 400 });
        }
        if (!team1Id || !team2Id) {
            return NextResponse.json({ error: "team1Id et team2Id requis" }, { status: 400 });
        }
        if (!team1Name || !team2Name) {
            return NextResponse.json({ error: "team1Name et team2Name requis" }, { status: 400 });
        }

        // Check if bet option already exists for this match
        const existing = await prisma.betOption.findUnique({
            where: { matchId },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Un pari existe déjà pour ce match" },
                { status: 409 }
            );
        }

        // Validate odds
        const validatedTeam1Odds = parseFloat(team1Odds) || 2.0;
        const validatedTeam2Odds = parseFloat(team2Odds) || 2.0;

        if (validatedTeam1Odds < 1.01 || validatedTeam1Odds > 50) {
            return NextResponse.json({ error: "Cotes team1 invalides (1.01-50)" }, { status: 400 });
        }
        if (validatedTeam2Odds < 1.01 || validatedTeam2Odds > 50) {
            return NextResponse.json({ error: "Cotes team2 invalides (1.01-50)" }, { status: 400 });
        }

        const betOption = await prisma.betOption.create({
            data: {
                matchId,
                matchName,
                matchSlug: matchSlug || null,
                team1Id,
                team1Name,
                team1Logo: team1Logo || null,
                team1Odds: validatedTeam1Odds,
                team2Id,
                team2Name,
                team2Logo: team2Logo || null,
                team2Odds: validatedTeam2Odds,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                createdById: session.user.id,
            },
        });

        return NextResponse.json({ success: true, betOption }, { status: 201 });
    });
}
