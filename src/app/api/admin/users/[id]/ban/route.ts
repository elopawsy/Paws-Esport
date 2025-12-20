/**
 * Admin Ban User API
 */

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
    return requireAdmin(async () => {
        const { id } = await params;
        const body = await request.json();
        const { reason, expiresIn } = body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                banned: true,
                banReason: reason || "Violation des règles",
                banExpires: expiresIn ? new Date(Date.now() + expiresIn) : null,
            },
        });

        return NextResponse.json({ success: true, user });
    });
}
