"use client";

import { useState, useEffect } from "react";
import { Coins, Clock, Trophy, TrendingUp } from "lucide-react";
import { useSession } from "@/lib/auth-client";

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

interface CurrentBetDisplayProps {
    matchId: number;
    teams: { id: number; name: string; acronym?: string; image_url?: string }[];
}

export default function CurrentBetDisplay({ matchId, teams }: CurrentBetDisplayProps) {
    const { data: session } = useSession();
    const [bet, setBet] = useState<Bet | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchBet() {
            if (!session?.user) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/user/bets?matchId=${matchId}`);
                if (res.ok) {
                    const data = await res.json();
                    setBet(data.bet);
                }
            } catch (error) {
                console.error("Error fetching bet:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBet();
    }, [matchId, session?.user]);

    if (!session?.user || isLoading || !bet) {
        return null;
    }

    const selectedTeam = teams.find(t => t.id === bet.teamId);

    const getStatusInfo = () => {
        switch (bet.status) {
            case "WON":
                return {
                    label: "Pari Gagné ! 🎉",
                    color: "text-green-500",
                    bg: "bg-green-500/10",
                    border: "border-green-500/30",
                    icon: Trophy
                };
            case "LOST":
                return {
                    label: "Pari Perdu",
                    color: "text-red-500",
                    bg: "bg-red-500/10",
                    border: "border-red-500/30",
                    icon: TrendingUp
                };
            default:
                return {
                    label: "Ton Pari",
                    color: "text-yellow-500",
                    bg: "bg-yellow-500/10",
                    border: "border-yellow-500/30",
                    icon: Clock
                };
        }
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    return (
        <div className={`p-4 rounded-lg ${statusInfo.bg} border ${statusInfo.border}`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                    <div>
                        <span className={`font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>sur</span>
                            {selectedTeam?.image_url ? (
                                <img src={selectedTeam.image_url} alt="" className="w-4 h-4 object-contain" />
                            ) : null}
                            <span className="font-medium text-foreground">
                                {selectedTeam?.name || selectedTeam?.acronym || `Team #${bet.teamId}`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-lg font-bold">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span>{bet.amount}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Mise</span>
                    </div>

                    <div className="text-center">
                        <span className="text-lg font-bold">x{bet.odds.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground block">Cote</span>
                    </div>

                    <div className="text-center">
                        <span className={`text-lg font-bold ${bet.status === "WON" ? "text-green-500" : ""}`}>
                            {bet.status === "WON" ? "+" : ""}{bet.potentialWin}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                            {bet.status === "WON" ? "Gagné" : bet.status === "LOST" ? "Perdu" : "Gain potentiel"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
