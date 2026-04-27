"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Coins, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface BetOption {
    id: string;
    matchId: number;
    matchName: string;
    matchSlug: string | null;
    team1Id: number;
    team1Name: string;
    team1Logo: string | null;
    team1Odds: number;
    team2Id: number;
    team2Name: string;
    team2Logo: string | null;
    team2Odds: number;
    scheduledAt: string | null;
}

export default function AvailableBetsSection() {
    const { data: session } = useSession();
    const [betOptions, setBetOptions] = useState<BetOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBets() {
            try {
                const res = await fetch("/api/bets/available?limit=6");
                if (res.ok) {
                    const data = await res.json();
                    setBetOptions(data.betOptions || []);
                }
            } catch (error) {
                console.error("Error fetching bets:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBets();
    }, []);

    if (loading || betOptions.length === 0) {
        return null; // Don't show section if no bets available
    }

    return (
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Coins className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className="text-xl font-display font-bold uppercase tracking-wide text-foreground">
                    Paris Disponibles
                </h3>
                <span className="ml-auto px-3 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-full border border-card-border">
                    {betOptions.length}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {betOptions.map((bet) => (
                    <div
                        key={bet.id}
                        className="bg-card border border-card-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                    >
                        {/* Match Name */}
                        <p className="font-medium text-sm text-muted-foreground mb-3 truncate">
                            {bet.matchName}
                        </p>

                        {/* Teams vs */}
                        <div className="flex items-center justify-between gap-4 mb-4">
                            {/* Team 1 */}
                            <div className="flex-1 text-center">
                                {bet.team1Logo && (
                                    <img
                                        src={bet.team1Logo}
                                        alt={bet.team1Name}
                                        className="w-10 h-10 mx-auto mb-2 object-contain"
                                    />
                                )}
                                <p className="text-sm font-medium truncate">{bet.team1Name}</p>
                                <p className="text-lg font-bold text-green-500">
                                    x{bet.team1Odds.toFixed(2)}
                                </p>
                            </div>

                            <span className="text-xs text-muted-foreground font-bold">VS</span>

                            {/* Team 2 */}
                            <div className="flex-1 text-center">
                                {bet.team2Logo && (
                                    <img
                                        src={bet.team2Logo}
                                        alt={bet.team2Name}
                                        className="w-10 h-10 mx-auto mb-2 object-contain"
                                    />
                                )}
                                <p className="text-sm font-medium truncate">{bet.team2Name}</p>
                                <p className="text-lg font-bold text-green-500">
                                    x{bet.team2Odds.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Schedule */}
                        {bet.scheduledAt && (
                            <p className="text-xs text-muted-foreground text-center mb-3">
                                {new Date(bet.scheduledAt).toLocaleString("fr-FR", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        )}

                        {/* Action */}
                        {session ? (
                            <Link
                                href={bet.matchSlug ? `/match/${bet.matchSlug}` : `/match/${bet.matchId}`}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                            >
                                <TrendingUp className="w-4 h-4" />
                                Parier
                            </Link>
                        ) : (
                            <p className="text-center text-xs text-muted-foreground">
                                Connecte-toi pour parier
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* View More */}
            {betOptions.length >= 6 && (
                <div className="mt-4 text-center">
                    <Link
                        href="/tournaments"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Voir tous les matchs
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </section>
    );
}
