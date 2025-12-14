"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PlayerCard from "@/components/ui/PlayerCard";
import { TeamFull } from "@/lib/types";
import { DndContext } from "@dnd-kit/core";

export default function TeamPage() {
    const params = useParams();
    const teamId = params.id as string;

    const [team, setTeam] = useState<TeamFull | null>(null);
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
                setError(err instanceof Error ? err.message : "Une erreur est survenue");
            } finally {
                setLoading(false);
            }
        }
        if (teamId) fetchTeam();
    }, [teamId]);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 bg-navy-700 rounded-xl" />
                        <div>
                            <div className="h-8 w-48 bg-navy-700 rounded mb-2" />
                            <div className="h-4 w-32 bg-navy-700 rounded" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 h-52" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <h3 className="text-xl font-bold text-white mb-2">Équipe non trouvée</h3>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
                    >
                        Retour aux équipes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <DndContext onDragEnd={() => { }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Retour aux équipes
                </Link>

                {/* Team Header */}
                <header className="flex flex-col sm:flex-row items-center gap-6 mb-10 p-6 bg-navy-800/50 backdrop-blur-sm border border-navy-700 rounded-2xl">
                    <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center bg-navy-800 rounded-xl">
                        <img
                            src={team.logo}
                            alt={team.name}
                            className="w-20 h-20 object-contain drop-shadow-2xl"
                            loading="lazy"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.parentElement!.innerHTML = `<span class="text-4xl font-bold text-orange-500">${team.name.charAt(0)}</span>`;
                            }}
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{team.name}</h1>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-gray-400">
                            <span className="flex items-center gap-1">
                                <span className="text-xl">{getFlagEmoji(team.country?.code?.toLowerCase())}</span>
                                {team.country?.name}
                            </span>
                            {team.rank && (
                                <>
                                    <span className="text-navy-600">•</span>
                                    <span className="px-2 py-1 bg-hltv-orange/20 text-hltv-orange font-bold rounded-lg text-sm">
                                        #{team.rank} Mondial
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="sm:ml-auto">
                        <Link
                            href={`/simulator?team=${team.id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Ajouter au simulateur
                        </Link>
                    </div>
                </header>

                {/* Players Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <span className="w-2 h-6 bg-cyan-500 rounded-full" />
                        Roster ({team.players.length} joueurs)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
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

                {/* Coach Section */}
                {team.coach && (
                    <section className="mt-8">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-2 h-6 bg-gray-500 rounded-full" />
                            Coach
                        </h2>
                        <div className="max-w-xs">
                            <PlayerCard
                                player={team.coach}
                                teamId={team.id}
                                isDraggable={false}
                            />
                        </div>
                    </section>
                )}
            </div>
        </DndContext>
    );
}

function getFlagEmoji(countryCode: string | undefined): string {
    if (!countryCode || countryCode === "xx") return "🏳️";

    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);

    return String.fromCodePoint(...codePoints);
}
