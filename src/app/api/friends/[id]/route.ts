import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// PATCH: Accept or reject friend request
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const { action } = await request.json();

        if (!["accept", "reject"].includes(action)) {
            return NextResponse.json({ error: "Action invalide" }, { status: 400 });
        }

        // Find friendship
        const friendship = await prisma.friendship.findUnique({
            where: { id },
        });

        if (!friendship) {
            return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
        }

        // Only receiver can accept/reject
        if (friendship.receiverId !== session.user.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        if (friendship.status !== "PENDING") {
            return NextResponse.json({ error: "Cette demande a déjà été traitée" }, { status: 400 });
        }

        // Update friendship status
        const updatedFriendship = await prisma.friendship.update({
            where: { id },
            data: {
                status: action === "accept" ? "ACCEPTED" : "REJECTED",
            },
        });

        return NextResponse.json({ success: true, friendship: updatedFriendship });
    } catch (error) {
        console.error("Error processing friend request:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// DELETE: Remove friend
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;

        // Find friendship
        const friendship = await prisma.friendship.findUnique({
            where: { id },
        });

        if (!friendship) {
            return NextResponse.json({ error: "Amitié non trouvée" }, { status: 404 });
        }

        // Only participants can delete
        if (friendship.senderId !== session.user.id && friendship.receiverId !== session.user.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        // Delete friendship
        await prisma.friendship.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing friend:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
