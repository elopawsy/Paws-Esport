"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Hash, Users, Activity, Plus } from "lucide-react";
import PlayerCard from "@/components/ui/PlayerCard";
import { Team } from "@/types";

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: teamId } = use(params);

    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTeam() {
            try {
                const res = await fetch(`/api/teams/${teamId}`);
                if (!res.ok) throw new Error("Unable to fetch team");
                const data = await res.json();
                setTeam(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error loading team");
            } finally {
                setLoading(false);
            }
        }
        if (teamId) fetchTeam();
    }, [teamId]);

    if (loading) {
        return (
            <div className="container-custom py-16 flex justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="container-custom py-20 text-center">
                <h3 className="text-2xl font-display uppercase mb-4 text-foreground">Team not found</h3>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-primary hover:underline transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="bg-card/30 border-b border-card-border">
                <div className="container-custom py-8">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm font-medium transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Database
                    </Link>

                    {/* Team Header */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center bg-card rounded-2xl border border-card-border p-4 shadow-lg shadow-black/5">
                            {team.image_url ? (
                                <Image
                                    src={team.image_url}
                                    alt={team.name}
                                    fill
                                    className="object-contain p-2"
                                />
                            ) : (
                                <span className="text-4xl font-display font-bold text-muted-foreground">{team.name.charAt(0)}</span>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight text-foreground mb-4">{team.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-muted-foreground">
                                {team.location && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-card-border">
                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                        {team.location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-card-border">
                                    <Hash className="w-3.5 h-3.5 text-primary" />
                                    ID: {team.slug}
                                </span>
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            {/* Players Section */}
            <div className="container-custom py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-display font-bold uppercase tracking-wide text-foreground">
                        Active Roster <span className="text-muted-foreground text-lg ml-2 font-normal">[{team.players.length}]</span>
                    </h2>
                </div>

                {team.players.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {team.players.map((player) => (
                            <div key={player.id} className="relative group">
                                <PlayerCard
                                    player={player}
                                    teamId={team.id}
                                    isDraggable={false}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 border border-dashed border-card-border rounded-2xl text-muted-foreground bg-card/20">
                        <Activity className="w-12 h-12 mb-4 opacity-20" />
                        <p>No active players in this team</p>
                    </div>
                )}
            </div>
        </div>
    );
}
