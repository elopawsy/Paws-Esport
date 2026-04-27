import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id; // User ID is a string in this schema

        // Fetch all comprehensive user data
        const userData = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                accounts: {
                    select: { providerId: true, createdAt: true },
                },
                sessions: {
                    select: { ipAddress: true, userAgent: true, createdAt: true, expiresAt: true },
                },
                bets: {
                    orderBy: { createdAt: "desc" },
                },
                sentFriendRequests: {
                    include: {
                        receiver: { select: { id: true, name: true, email: true } },
                    },
                },
                receivedFriendRequests: {
                    include: {
                        sender: { select: { id: true, name: true, email: true } },
                    },
                },
                favoriteTeam: true,
                notifications: true,
            },
        });

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Sanitize sensitive fields (hashes, tokens)
        // In the current schema, there are no password hashes on the User model directly (usually in Account),
        // but we should avoid returning raw tokens if they were selected.
        // We selected specific fields for sessions/accounts to avoid leaking tokens.

        const exportData = {
            exportDate: new Date().toISOString(),
            user: userData,
        };

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="user-data-${userId}.json"`,
            },
        });
    } catch (error) {
        console.error("Export data error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
