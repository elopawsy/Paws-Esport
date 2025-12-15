"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PlayerCard from "@/components/ui/PlayerCard";
import { Team } from "@/lib/types";
import { DndContext } from "@dnd-kit/core";

export default function TeamPage() {
    const params = useParams();
    const teamId = params.id as string;

    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTeam() {
            try {
                const res = await fetch(`/api/teams/${teamId}`);
                if (!res.ok) throw new Error("Failed to fetch team");
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
            <div className="container-custom py-16">
                <div className="animate-pulse space-y-12">
                    <div className="h-40 bg-card rounded-md w-full max-w-2xl" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-card h-80 rounded-md" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="container-custom py-20 text-center">
                <h3 className="text-2xl font-display uppercase mb-4">Team Not Found</h3>
                <Link
                    href="/"
                    className="text-sm border-b border-white pb-1 hover:text-muted transition-colors"
                >
                    Return to Index
                </Link>
            </div>
        );
    }

    return (
        <DndContext onDragEnd={() => { }}>
            <div className="container-custom py-12">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted hover:text-white mb-12 text-xs font-medium uppercase tracking-widest transition-colors"
                >
                    ← Back to Database
                </Link>

                {/* Team Header */}
                <header className="flex flex-col md:flex-row items-start md:items-end gap-8 mb-20 border-b border-card-border pb-10">
                    <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-card rounded-lg border border-card-border">
                        {team.image_url ? (
                            <img
                                src={team.image_url}
                                alt={team.name}
                                className="w-24 h-24 object-contain"
                                loading="lazy"
                            />
                        ) : (
                            <span className="text-4xl font-display text-muted">{team.name.charAt(0)}</span>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <h1 className="text-6xl font-display font-bold uppercase tracking-tight leading-none mb-4">{team.name}</h1>
                        <div className="flex items-center gap-4 text-sm font-medium text-muted uppercase tracking-wider">
                            {team.location && (
                                <span>{team.location}</span>
                            )}
                            <span className="text-card-border">|</span>
                             <span>ID: {team.slug}</span>
                        </div>
                    </div>
                    
                    <div>
                        <Link
                            href={`/simulator?team=${team.id}`}
                            className="inline-block px-6 py-3 bg-white text-black font-medium text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-sm"
                        >
                            Add to Simulator
                        </Link>
                    </div>
                </header>

                {/* Players Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-display font-medium uppercase tracking-wide">
                            Active Roster <span className="text-muted ml-2">[{team.players.length}]</span>
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {team.players.map((player) => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                teamId={team.id}
                                isDraggable={false}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </DndContext>
    );
}
