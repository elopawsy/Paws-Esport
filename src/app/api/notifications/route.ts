import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET: Get user's notifications
export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get("unread") === "true";

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
                ...(unreadOnly ? { read: false } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        // Get unread count
        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                read: false,
            },
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// PATCH: Mark notifications as read
export async function PATCH(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { notificationIds, markAllRead } = await request.json();

        if (markAllRead) {
            // Mark all as read
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    read: false,
                },
                data: { read: true },
            });
        } else if (notificationIds && Array.isArray(notificationIds)) {
            // Mark specific notifications as read
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId: session.user.id,
                },
                data: { read: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
