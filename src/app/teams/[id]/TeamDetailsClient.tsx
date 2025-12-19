"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Hash, Users, Swords, Calendar, Gamepad2, Monitor } from "lucide-react";
import PlayerCard from "@/components/ui/PlayerCard";
import MatchCard from "@/components/ui/MatchCard";
import FollowTeamButton from "@/components/ui/FollowTeamButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Team, Match } from "@/types";
import { VIDEO_GAMES, VideoGameSlug } from "@/types/videogame";

interface TeamDetailsClientProps {
    team: Team;
    matches: {
        upcoming: Match[];
        past: Match[];
    };
    relatedTeams: Team[];
}

export default function TeamDetailsClient({ team, matches, relatedTeams }: TeamDetailsClientProps) {
    const [activeTab, setActiveTab] = useState<"roster" | "matches">("roster");

    // Helper to get game info
    const getGameInfo = (slug?: string) => {
        if (!slug) return null;
        const gameSlug = Object.keys(VIDEO_GAMES).find(k => VIDEO_GAMES[k as VideoGameSlug].slug === slug) as VideoGameSlug;
        return gameSlug ? VIDEO_GAMES[gameSlug] : null;
    };

    const teamGame = team.current_videogame?.slug ? getGameInfo(team.current_videogame.slug) : null;

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Header Banner */}
            <div className="bg-card/30 border-b border-card-border">
                <div className="container-custom py-8">
                    <Breadcrumbs
                        items={[
                            { label: "Teams", href: "/#teams" }, // Assuming home has teams or there is a listing. We can just say "Database" or "Home"
                            { label: team.name }
                        ]}
                        className="mb-8"
                    />

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
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-muted-foreground mb-6">
                                {team.location && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-card-border">
                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                        {team.location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-card-border">
                                    <Hash className="w-3.5 h-3.5 text-primary" />
                                    ID: {team.id}
                                </span>
                                {team.current_videogame && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-card-border">
                                        <Monitor className="w-3.5 h-3.5 text-primary" />
                                        {team.current_videogame.name}
                                    </span>
                                )}
                            </div>

                            {/* Related Games (Sister Teams) */}
                            {relatedTeams.length > 0 && (
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 animate-in fade-in duration-500">
                                    <span className="text-xs font-bold uppercase text-muted-foreground mr-2">Departments:</span>
                                    {relatedTeams.map((relTeam) => (
                                        <Link
                                            key={relTeam.id}
                                            href={`/teams/${relTeam.id}`}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-primary/10 border border-card-border hover:border-primary/50 rounded-lg transition-all text-sm group"
                                        >
                                            {relTeam.image_url && (
                                                <Image
                                                    src={relTeam.image_url}
                                                    alt={relTeam.name}
                                                    width={16}
                                                    height={16}
                                                    className="object-contain"
                                                />
                                            )}
                                            <span className="group-hover:text-primary transition-colors">
                                                {relTeam.current_videogame?.name || "Unknown"}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Follow Button */}
                        <div className="flex-shrink-0">
                            <FollowTeamButton
                                teamId={team.id}
                                teamName={team.name}
                                teamAcronym={team.acronym}
                                teamImageUrl={team.image_url}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="container-custom mt-8 mb-8">
                <div className="flex justify-center border-b border-card-border">
                    <button
                        onClick={() => setActiveTab("roster")}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-medium ${activeTab === "roster"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        Roster
                    </button>
                    <button
                        onClick={() => setActiveTab("matches")}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-medium ${activeTab === "matches"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Swords className="w-4 h-4" />
                        Matches
                        {(matches.upcoming.length > 0 || matches.past.length > 0) && (
                            <span className="bg-secondary px-1.5 py-0.5 rounded-full text-xs">
                                {matches.upcoming.length + matches.past.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="container-custom">
                {activeTab === "roster" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-display font-bold uppercase tracking-wide text-foreground">
                                Active Players
                            </h2>
                        </div>

                        {team.players.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {team.players.map((player) => (
                                    <Link key={player.id} href={`/players/${player.id}`} className="block transition-transform hover:-translate-y-1">
                                        <PlayerCard
                                            player={player}
                                            teamId={team.id}
                                            isDraggable={false}
                                        />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-card-border rounded-2xl text-muted-foreground bg-card/20">
                                <Users className="w-12 h-12 mb-4 opacity-20" />
                                <p>No active players found for this roster.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "matches" && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Upcoming Matches */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Calendar className="w-5 h-5 text-primary" />
                                <h3 className="text-xl font-bold uppercase">Upcoming</h3>
                            </div>
                            {matches.upcoming.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {matches.upcoming.map((match) => (
                                        <MatchCard key={match.id} match={match} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">No upcoming matches scheduled.</p>
                            )}
                        </section>

                        {/* Past Matches */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Swords className="w-5 h-5 text-muted-foreground" />
                                <h3 className="text-xl font-bold uppercase">Recent Results</h3>
                            </div>
                            {matches.past.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {matches.past.map((match) => (
                                        <MatchCard key={match.id} match={match} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">No recent matches found.</p>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
