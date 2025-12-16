"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Search, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { Team } from "@/types";
import CountryFlag from "@/components/ui/CountryFlag";

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchTeams() {
            try {
                const res = await fetch("/api/teams/all");
                if (!res.ok) throw new Error("Failed to fetch teams");
                const data = await res.json();
                setTeams(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }
        fetchTeams();
    }, []);

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card/30 border-b border-card-border backdrop-blur-sm sticky top-16 z-40">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground mb-2 uppercase tracking-wide">
                                Professional <span className="text-primary">Teams</span>
                            </h1>
                            <p className="text-muted-foreground">
                                Browse all active esports organizations and rosters
                            </p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 pl-9 pr-4 py-2 bg-secondary border border-card-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container-custom py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : error ? (
                    <div className="py-20 text-center bg-destructive/5 rounded-xl border border-destructive/20">
                        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
                        <p className="text-destructive font-mono text-sm uppercase mb-4">
                            Error: {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-secondary text-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTeams.map((team) => (
                            <Link
                                key={team.id}
                                href={`/teams/${team.id}`}
                                className="group relative bg-card border border-card-border rounded-xl p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-secondary/50 rounded-lg p-2 border border-card-border group-hover:border-primary/30 transition-colors flex items-center justify-center">
                                        {team.image_url ? (
                                            <Image
                                                src={team.image_url}
                                                alt={team.name}
                                                width={48}
                                                height={48}
                                                className="object-contain"
                                            />
                                        ) : (
                                            <span className="font-bold text-muted-foreground">{team.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    {team.location && (
                                        <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                                            <CountryFlag code={team.location} size="sm" />
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-tight mb-1 truncate group-hover:text-primary transition-colors">
                                    {team.name}
                                </h3>

                                <div className="mt-auto pt-4 border-t border-card-border flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-primary" />
                                        {team.players?.length || 0} Players
                                    </span>
                                    {team.acronym && (
                                        <span className="px-2 py-0.5 bg-secondary rounded text-[10px]">
                                            {team.acronym}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                        {filteredTeams.length === 0 && (
                            <div className="col-span-full py-20 text-center border dashed border-card-border rounded-xl">
                                <Search className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <p className="text-muted-foreground font-medium">No teams found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
