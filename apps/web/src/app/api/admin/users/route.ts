/**
 * Admin Users API
 * 
 * List and manage users
 */

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

// GET: List all users (with pagination)
export async function GET(request: Request) {
    return requireAdmin(async () => {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";

        const where = search
            ? {
                OR: [
                    { email: { contains: search, mode: "insensitive" as const } },
                    { name: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    banned: true,
                    banReason: true,
                    coins: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    });
}
