"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2, Calendar, ChevronRight, Clock } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Match {
    id: number;
    name: string;
    status: string;
    begin_at: string | null;
    scheduled_at: string | null;
    tournament: {
        id: number;
        name: string;
    } | null;
    league: {
        id: number;
        name: string;
        image_url: string | null;
    } | null;
    opponents: {
        type: string;
        opponent: {
            id: number;
            name: string;
            acronym: string | null;
            image_url: string | null;
        };
    }[];
    videogame: {
        id: number;
        name: string;
        slug: string;
    } | null;
}

function formatMatchTime(dateStr: string | null) {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 0) return "Starting soon";
    if (diffHours < 1) return "< 1 hour";
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TrackedTeamsMatches() {
    const { data: session } = useSession();
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!session?.user) {
            setIsLoading(false);
            return;
        }

        async function fetchMatches() {
            try {
                const res = await fetch("/api/user/tracked-teams/matches");
                if (res.ok) {
                    const data = await res.json();
                    setMatches(data);
                }
            } catch (error) {
                console.error("Error fetching tracked teams matches:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchMatches();
    }, [session?.user]);

    // Don't show if not logged in or no matches
    if (!session?.user) return null;
    if (!isLoading && matches.length === 0) return null;

    return (
        <section className="mb-12 bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-display font-bold uppercase tracking-wide text-foreground">
                            Your Teams
                        </h3>
                        <p className="text-sm text-muted-foreground">Upcoming matches from teams you follow</p>
                    </div>
                </div>
                <Link
                    href="/profile"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    Manage <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.slice(0, 6).map((match) => (
                        <Link
                            key={match.id}
                            href={`/match/${match.id}`}
                            className="block bg-card hover:bg-card/80 border border-card-border hover:border-primary/30 rounded-xl p-4 transition-all group"
                        >
                            {/* League/Tournament */}
                            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                                {match.league?.image_url && (
                                    <Image
                                        src={match.league.image_url}
                                        alt={match.league.name}
                                        width={16}
                                        height={16}
                                        className="rounded"
                                    />
                                )}
                                <span className="truncate">{match.tournament?.name || match.league?.name}</span>
                            </div>

                            {/* Teams */}
                            <div className="flex items-center justify-between gap-4">
                                {match.opponents[0] && (
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {match.opponents[0].opponent.image_url ? (
                                            <Image
                                                src={match.opponents[0].opponent.image_url}
                                                alt={match.opponents[0].opponent.name}
                                                width={28}
                                                height={28}
                                                className="rounded"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 bg-secondary rounded flex items-center justify-center text-xs font-bold">
                                                {match.opponents[0].opponent.acronym?.[0] || match.opponents[0].opponent.name[0]}
                                            </div>
                                        )}
                                        <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                            {match.opponents[0].opponent.acronym || match.opponents[0].opponent.name}
                                        </span>
                                    </div>
                                )}

                                <span className="text-sm font-medium text-muted-foreground">vs</span>

                                {match.opponents[1] && (
                                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                        <span className="font-medium text-sm truncate group-hover:text-primary transition-colors text-right">
                                            {match.opponents[1].opponent.acronym || match.opponents[1].opponent.name}
                                        </span>
                                        {match.opponents[1].opponent.image_url ? (
                                            <Image
                                                src={match.opponents[1].opponent.image_url}
                                                alt={match.opponents[1].opponent.name}
                                                width={28}
                                                height={28}
                                                className="rounded"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 bg-secondary rounded flex items-center justify-center text-xs font-bold">
                                                {match.opponents[1].opponent.acronym?.[0] || match.opponents[1].opponent.name[0]}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Time */}
                            <div className="mt-3 pt-3 border-t border-card-border flex items-center gap-2 text-xs">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span className="text-muted-foreground">
                                    {formatMatchTime(match.begin_at || match.scheduled_at)}
                                </span>
                                {match.videogame && (
                                    <span className="ml-auto px-2 py-0.5 bg-secondary rounded text-muted-foreground">
                                        {match.videogame.name}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
