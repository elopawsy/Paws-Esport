
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Coins, Heart, Trophy, Calendar, Check, UserPlus, Clock } from "lucide-react";

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
    // Await params as per Next.js 15+ requirements if applicable, or safe access
    const { id } = await Promise.resolve(params);

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            favoriteTeam: true,
            bets: {
                orderBy: { createdAt: "desc" },
                take: 10,
                where: { status: { in: ["WON", "LOST", "PENDING"] } }
            }
        },
    });

    if (!user) {
        notFound();
    }

    // Check friendship status
    let friendshipStatus: "NONE" | "PENDING" | "ACCEPTED" | "SELF" = "NONE";

    if (session?.user) {
        if (session.user.id === user.id) {
            friendshipStatus = "SELF";
        } else {
            const friendship = await prisma.friendship.findFirst({
                where: {
                    OR: [
                        { senderId: session.user.id, receiverId: user.id },
                        { senderId: user.id, receiverId: session.user.id }
                    ]
                }
            });
            if (friendship) {
                friendshipStatus = friendship.status as "PENDING" | "ACCEPTED";
            }
        }
    }

    // Calculate stats
    const totalBets = await prisma.bet.count({ where: { userId: user.id } });
    const wonBets = await prisma.bet.count({ where: { userId: user.id, status: "WON" } });
    const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0;

    return (
        <div className="container-custom py-8">
            {/* Header / Profile Card */}
            <div className="bg-card border border-card-border rounded-xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-secondary border-4 border-card-border flex items-center justify-center overflow-hidden">
                        {user.image ? (
                            <Image src={user.image} alt={user.name || "User"} width={128} height={128} className="object-cover w-full h-full" />
                        ) : (
                            <User className="w-12 h-12 text-muted-foreground" />
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                            {user.name || "Unknown User"}
                        </h1>
                        <p className="text-muted-foreground mb-4">Member since {new Date(user.createdAt).getFullYear()}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            {user.favoriteTeam && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-card-border text-sm">
                                    <Heart className="w-4 h-4 text-primary" />
                                    <span>Fan of <span className="font-bold">{user.favoriteTeam.name}</span></span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20 text-sm font-bold">
                                <Coins className="w-4 h-4" />
                                {user.coins.toLocaleString()} Coins
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {friendshipStatus === "SELF" && (
                            <Link href="/profile" className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors">
                                Edit Profile
                            </Link>
                        )}
                        {friendshipStatus === "NONE" && session?.user && (
                            <AddFriendButton userId={user.id} />
                        )}
                        {friendshipStatus === "PENDING" && (
                            <div className="px-4 py-2 bg-secondary/50 text-muted-foreground rounded-lg flex items-center gap-2 cursor-default">
                                <Clock className="w-4 h-4" /> Request Pending
                            </div>
                        )}
                        {friendshipStatus === "ACCEPTED" && (
                            <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg flex items-center gap-2 cursor-default font-bold border border-green-500/20">
                                <Check className="w-4 h-4" /> Friends
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Stats */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card border border-card-border rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            Statistics
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-card-border last:border-0">
                                <span className="text-muted-foreground">Total Bets</span>
                                <span className="font-bold">{totalBets}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-card-border last:border-0">
                                <span className="text-muted-foreground">Won Bets</span>
                                <span className="font-bold text-green-500">{wonBets}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-card-border last:border-0">
                                <span className="text-muted-foreground">Win Rate</span>
                                <span className="font-bold">{winRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="md:col-span-2">
                    <div className="bg-card border border-card-border rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Recent Activity
                        </h3>

                        {user.bets.length > 0 ? (
                            <div className="space-y-3">
                                {user.bets.map(bet => (
                                    <div key={bet.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-card-border">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${bet.status === 'WON' ? 'bg-green-500/10 text-green-500' :
                                                bet.status === 'LOST' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {bet.status === 'WON' ? <Trophy className="w-4 h-4" /> :
                                                    bet.status === 'LOST' ? <Coins className="w-4 h-4" /> :
                                                        <Clock className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">
                                                    Match #{bet.matchId}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(bet.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold block">{bet.amount} coins</span>
                                            <span className={`text-xs font-bold ${bet.status === 'WON' ? 'text-green-500' :
                                                bet.status === 'LOST' ? 'text-red-500' :
                                                    'text-yellow-500'
                                                }`}>{bet.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No recent activity visible.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Client Component for Add Friend Button
import AddFriendButton from "@/components/ui/AddFriendButton";
