/**
 * Admin Unban User API
 */

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
    return requireAdmin(async () => {
        const { id } = await params;

        const user = await prisma.user.update({
            where: { id },
            data: {
                banned: false,
                banReason: null,
                banExpires: null,
            },
        });

        return NextResponse.json({ success: true, user });
    });
}
