/**
 * Admin Stats API
 * 
 * Dashboard statistics for admin panel
 */

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
    return requireAdmin(async () => {
        const [totalUsers, totalBets, activeBetOptions, pendingBets] = await Promise.all([
            prisma.user.count(),
            prisma.bet.count(),
            prisma.betOption.count({ where: { isActive: true } }),
            prisma.bet.count({ where: { status: "PENDING" } }),
        ]);

        return NextResponse.json({
            totalUsers,
            totalBets,
            activeBetOptions,
            pendingBets,
        });
    });
}
