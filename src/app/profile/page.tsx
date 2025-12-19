import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/");
    }

    // Fetch user data with favorite team
    const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            favoriteTeam: true,
            sentFriendRequests: {
                where: { status: "ACCEPTED" },
                include: {
                    receiver: {
                        select: { id: true, name: true, email: true, image: true, coins: true },
                    },
                },
            },
            receivedFriendRequests: {
                include: {
                    sender: {
                        select: { id: true, name: true, email: true, image: true, coins: true },
                    },
                },
            },
        },
    });

    // Get list of teams for favorite selector
    const teams = await prisma.team.findMany({
        select: { id: true, name: true, acronym: true, imageUrl: true },
        orderBy: { name: "asc" },
        take: 100,
    });

    // Separate accepted friends and pending requests
    const acceptedFriends = [
        ...userData!.sentFriendRequests.map((f) => ({
            friendshipId: f.id,
            user: f.receiver,
        })),
        ...userData!.receivedFriendRequests
            .filter((f) => f.status === "ACCEPTED")
            .map((f) => ({
                friendshipId: f.id,
                user: f.sender,
            })),
    ];

    const pendingRequests = userData!.receivedFriendRequests
        .filter((f) => f.status === "PENDING")
        .map((f) => ({
            friendshipId: f.id,
            user: f.sender,
        }));

    return (
        <ProfileClient
            user={{
                id: userData!.id,
                name: userData!.name,
                email: userData!.email,
                image: userData!.image,
                coins: userData!.coins,
                favoriteTeam: userData!.favoriteTeam,
            }}
            teams={teams}
            friends={acceptedFriends}
            pendingRequests={pendingRequests}
        />
    );
}
