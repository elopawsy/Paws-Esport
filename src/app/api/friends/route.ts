import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET: Get friends list
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get all accepted friendships
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { senderId: userId, status: "ACCEPTED" },
                    { receiverId: userId, status: "ACCEPTED" },
                ],
            },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, image: true, coins: true },
                },
                receiver: {
                    select: { id: true, name: true, email: true, image: true, coins: true },
                },
            },
        });

        // Map to friend list (excluding self)
        const friends = friendships.map((f) => ({
            friendshipId: f.id,
            user: f.senderId === userId ? f.receiver : f.sender,
        }));

        return NextResponse.json({ friends });
    } catch (error) {
        console.error("Error fetching friends:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// POST: Send friend request
export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email invalide" }, { status: 400 });
        }

        // Find user by email
        const targetUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!targetUser) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        if (targetUser.id === session.user.id) {
            return NextResponse.json({ error: "Tu ne peux pas t'ajouter toi-même" }, { status: 400 });
        }

        // Check if friendship already exists
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: targetUser.id },
                    { senderId: targetUser.id, receiverId: session.user.id },
                ],
            },
        });

        if (existingFriendship) {
            if (existingFriendship.status === "ACCEPTED") {
                return NextResponse.json({ error: "Vous êtes déjà amis" }, { status: 400 });
            }
            if (existingFriendship.status === "PENDING") {
                return NextResponse.json({ error: "Une demande est déjà en attente" }, { status: 400 });
            }
        }

        // Create friend request
        const friendship = await prisma.friendship.create({
            data: {
                senderId: session.user.id,
                receiverId: targetUser.id,
                status: "PENDING",
            },
        });

        return NextResponse.json({ success: true, friendship });
    } catch (error) {
        console.error("Error sending friend request:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
