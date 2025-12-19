"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Loader2, Trophy, XCircle, Clock, Coins, ExternalLink } from "lucide-react";

interface Bet {
    id: string;
    matchId: number;
    teamId: number;
    amount: number;
    odds: number;
    potentialWin: number;
    status: "PENDING" | "WON" | "LOST" | "CANCELED";
    createdAt: string;
}

export default function BetHistory() {
    const [bets, setBets] = useState<Bet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "PENDING" | "WON" | "LOST">("all");

    useEffect(() => {
        let mounted = true;

        async function checkAndFetch() {
            try {
                // 1. Fetch current state immediately
                await fetchBets();

                // 2. Trigger settlement in background (lazy update)
                const settleRes = await fetch("/api/bets/settle", { method: "POST" });
                if (settleRes.ok && mounted) {
                    const settleData = await settleRes.json();
                    // 3. If bets were actually settled, refresh the list
                    if (settleData.settled > 0) {
                        await fetchBets();
                    }
                }
            } catch (error) {
                console.error("Error in auto-settlement:", error);
            }
        }

        async function fetchBets() {
            try {
                const statusParam = filter !== "all" ? `?status=${filter}` : "";
                const res = await fetch(`/api/bets${statusParam}`);
                if (res.ok && mounted) {
                    const data = await res.json();
                    setBets(data.bets || []);
                }
            } catch (error) {
                console.error("Error fetching bets:", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        checkAndFetch();

        return () => { mounted = false; };
    }, [filter]);

    const getStatusInfo = (status: Bet["status"]) => {
        switch (status) {
            case "WON":
                return { label: "Won", icon: Trophy, color: "text-green-500", bg: "bg-green-500/10" };
            case "LOST":
                return { label: "Lost", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" };
            case "CANCELED":
                return { label: "Canceled", icon: XCircle, color: "text-muted-foreground", bg: "bg-secondary" };
            default:
                return { label: "Ongoing", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" };
        }
    };

    const totalBets = bets.length;
    const wonBets = bets.filter(b => b.status === "WON").length;
    const lostBets = bets.filter(b => b.status === "LOST").length;
    const pendingBets = bets.filter(b => b.status === "PENDING").length;
    const totalEarnings = bets.filter(b => b.status === "WON").reduce((sum, b) => sum + b.potentialWin, 0);
    const totalLosses = bets.filter(b => b.status === "LOST").reduce((sum, b) => sum + b.amount, 0);

    return (
        <div className="bg-card border border-card-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">My Bets</h3>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{totalBets}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-500">{wonBets}</p>
                    <p className="text-xs text-muted-foreground">Won</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-500">{lostBets}</p>
                    <p className="text-xs text-muted-foreground">Lost</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-500">{pendingBets}</p>
                    <p className="text-xs text-muted-foreground">Ongoing</p>
                </div>
            </div>

            {/* Profit/Loss Summary */}
            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg mb-6">
                <span className="text-sm text-muted-foreground">Total Balance</span>
                <span className={`font-bold text-lg ${totalEarnings - totalLosses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalEarnings - totalLosses >= 0 ? '+' : ''}{(totalEarnings - totalLosses).toLocaleString()} coins
                </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {(["all", "PENDING", "WON", "LOST"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === f
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                            }`}
                    >
                        {f === "all" ? "All" : f === "PENDING" ? "Ongoing" : f === "WON" ? "Won" : "Lost"}
                    </button>
                ))}
            </div>

            {/* Bets List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : bets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                    {filter === "all" ? "You haven't placed any bets yet" : "No bets in this category"}
                </p>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {bets.map((bet) => {
                        const statusInfo = getStatusInfo(bet.status);
                        const StatusIcon = statusInfo.icon;
                        return (
                            <div
                                key={bet.id}
                                className={`flex items-center justify-between p-4 rounded-lg border border-card-border ${statusInfo.bg}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${statusInfo.bg}`}>
                                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                                    </div>
                                    <div>
                                        <Link
                                            href={`/match/${bet.matchId}`}
                                            className="font-medium hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                            Match #{bet.matchId}
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>x{bet.odds.toFixed(2)}</span>
                                            <span>•</span>
                                            <span>{new Date(bet.createdAt).toLocaleDateString('en-US')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center gap-1 font-bold">
                                        <Coins className="w-4 h-4 text-yellow-500" />
                                        <span>{bet.amount}</span>
                                    </div>
                                    {bet.status === "WON" && (
                                        <span className="text-sm text-green-500">+{bet.potentialWin}</span>
                                    )}
                                    {bet.status === "PENDING" && (
                                        <span className="text-xs text-muted-foreground">→ {bet.potentialWin}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
