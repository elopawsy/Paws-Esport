/**
 * Admin User Operations API
 * 
 * Update user role and manage individual users
 */

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT: Update user (role, etc.)
export async function PUT(request: Request, { params }: RouteParams) {
    return requireAdmin(async () => {
        const { id } = await params;
        const body = await request.json();
        const { role } = body;

        if (role && !["user", "bet_manager", "admin"].includes(role)) {
            return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return NextResponse.json({ success: true, user });
    });
}
