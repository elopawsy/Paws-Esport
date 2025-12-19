import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Transactional delete to ensure consistency
        // Note: Prisma relations with onDelete: Cascade (defined in schema) handle child records (Sessions, Accounts, Bets, etc.)
        // However, checking schema for 'onDelete: Cascade' is important.
        // Looking at schema provided:
        // Session -> onDelete: Cascade (YES)
        // Account -> onDelete: Cascade (YES)
        // Bet -> defined relation user User, but 'onDelete: Cascade' in Bet model?
        // Let's re-verify logic. If not cascade, we must delete manually.
        // Schema snippet shows:
        // model Bet { user User @relation(..., onDelete: Cascade) } -> YES
        // model Notification { user User @relation(..., onDelete: Cascade) } -> YES
        // model Friendship { sender/receiver User ... onDelete: Cascade } -> YES

        // EVERYTHING seems to be Cascade. So deleting User is enough.

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Delete account error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
