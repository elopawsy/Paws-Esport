"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Coins, TrendingUp, Target, Crown, Medal, Award, Loader2 } from "lucide-react";
import AddFriendButton from "@/components/ui/AddFriendButton";
import { useSession } from "@/lib/auth-client";

interface LeaderboardUser {
    id: string;
    name: string;
    image: string | null;
    coins: number;
    friendshipStatus?: "NONE" | "FRIEND" | "PENDING" | "SELF";
    stats: {
        totalBets: number;
        wonBets: number;
        lostBets: number;
        winRate: number;
        totalEarnings: number;
        netProfit: number;
    };
}

type TabType = "coins" | "winrate" | "earnings" | "profit";

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<TabType>("coins");
    const [data, setData] = useState<{
        byCoins: LeaderboardUser[];
        byWinRate: LeaderboardUser[];
        byEarnings: LeaderboardUser[];
        byProfit: LeaderboardUser[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await fetch("/api/leaderboard");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    const tabs: { id: TabType; label: string; icon: React.ElementType; color: string }[] = [
        { id: "coins", label: "Most Coins", icon: Coins, color: "text-yellow-500" },
        { id: "winrate", label: "Highest Winrate", icon: Target, color: "text-green-500" },
        { id: "earnings", label: "Most Earnings", icon: TrendingUp, color: "text-blue-500" },
        { id: "profit", label: "Best Profit", icon: Trophy, color: "text-purple-500" },
    ];

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 0:
                return <Crown className="w-5 h-5 text-yellow-500" />;
            case 1:
                return <Medal className="w-5 h-5 text-gray-400" />;
            case 2:
                return <Award className="w-5 h-5 text-orange-400" />;
            default:
                return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank + 1}</span>;
        }
    };

    const getCurrentData = () => {
        if (!data) return [];
        switch (activeTab) {
            case "coins":
                return data.byCoins;
            case "winrate":
                return data.byWinRate;
            case "earnings":
                return data.byEarnings;
            case "profit":
                return data.byProfit;
        }
    };

    const getStatDisplay = (user: LeaderboardUser) => {
        switch (activeTab) {
            case "coins":
                return (
                    <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-yellow-500">{user.coins.toLocaleString()}</span>
                    </div>
                );
            case "winrate":
                return (
                    <div className="text-right">
                        <span className="font-bold text-green-500">{user.stats.winRate}%</span>
                        <span className="text-xs text-muted-foreground ml-2">
                            ({user.stats.wonBets}W / {user.stats.lostBets}L)
                        </span>
                    </div>
                );
            case "earnings":
                return (
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-blue-500">+{user.stats.totalEarnings.toLocaleString()}</span>
                    </div>
                );
            case "profit":
                return (
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-purple-500" />
                        <span className={`font-bold ${user.stats.netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {user.stats.netProfit >= 0 ? "+" : ""}{user.stats.netProfit.toLocaleString()}
                        </span>
                    </div>
                );
        }
    };

    return (
        <div className="container-custom py-8">
            <div className="flex items-center gap-3 mb-8">
                <Trophy className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-display font-bold">Leaderboard</h1>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-card-border hover:border-primary/50"
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "" : tab.color}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Leaderboard Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-card-border bg-secondary/30 text-sm font-medium text-muted-foreground">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-5 sm:col-span-6">Player</div>
                        <div className="col-span-3 sm:col-span-2 text-center">Bets</div>
                        <div className="col-span-3 text-right">
                            {activeTab === "coins" && "Coins"}
                            {activeTab === "winrate" && "Winrate"}
                            {activeTab === "earnings" && "Earnings"}
                            {activeTab === "profit" && "Profit"}
                        </div>
                    </div>

                    {/* Rows */}
                    {getCurrentData().length === 0 ? (
                        <div className="px-6 py-12 text-center text-muted-foreground">
                            No players to display
                        </div>
                    ) : (
                        getCurrentData().map((user, index) => (
                            <div
                                key={user.id}
                                className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-card-border last:border-0 hover:bg-secondary/20 transition-colors ${index < 3 ? "bg-primary/5" : ""
                                    }`}
                            >
                                {/* Rank */}
                                <div className="col-span-1 flex items-center">
                                    {getRankIcon(index)}
                                </div>

                                {/* User */}
                                <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
                                    <Link href={`/u/${user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {user.image ? (
                                                <img src={user.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-primary">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-medium truncate">{user.name}</span>
                                    </Link>
                                    {user.friendshipStatus === "NONE" && session?.user?.id !== user.id && (
                                        <AddFriendButton userId={user.id} minimal className="ml-2" />
                                    )}
                                    {/* Optional: Show status icons */}
                                    {user.friendshipStatus === "FRIEND" && (
                                        <span className="ml-2 text-green-500 text-xs" title="Friend">●</span>
                                    )}
                                </div>

                                {/* Total bets */}
                                <div className="col-span-3 sm:col-span-2 flex items-center justify-center text-sm text-muted-foreground">
                                    {user.stats.totalBets} bets
                                </div>

                                {/* Main stat */}
                                <div className="col-span-3 flex items-center justify-end">
                                    {getStatDisplay(user)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Legend */}
            {activeTab === "winrate" && (
                <p className="mt-4 text-sm text-muted-foreground text-center">
                    * Minimum 3 bets required to specific in this leaderboard
                </p>
            )}
        </div>
    );
}
