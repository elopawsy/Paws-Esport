"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trophy, Calendar, Coins, Play, Clock, CheckCircle, GitMerge } from "lucide-react";
import { BracketView } from "@/components/tournament/BracketView";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { TournamentFull, Match } from "@/types";

function getTournamentDisplayName(tournament: TournamentFull | null) {
    if (!tournament) return "Tournament";
    const parts = [];
    if (tournament.league?.name) parts.push(tournament.league.name);
    if (tournament.serie?.full_name) parts.push(tournament.serie.full_name);
    if (tournament.name) parts.push(tournament.name);

    // Deduplicate if needed, or just join.
    // Sometimes series name includes league name.
    // E.g. League: ESL Pro League, Serie: Season 18, Name: Playoffs -> ESL Pro League Season 18 Playoffs
    return parts.join(" ");
}

function MatchCard({ match }: { match: Match }) {
    const team1 = match.opponents[0]?.opponent;
    const team2 = match.opponents[1]?.opponent;
    const score1 = match.results?.find((r) => r.team_id === team1?.id)?.score;
    const score2 = match.results?.find((r) => r.team_id === team2?.id)?.score;

    // ... (rest of component) ...

    const statusColors: Record<string, string> = {
        running: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse",
        finished: "bg-secondary text-muted-foreground border-card-border",
        not_started: "bg-primary/10 text-primary border-primary/20",
    };

    return (
        <Link
            href={`/match/${match.id}`}
            className="block bg-card border border-card-border rounded-xl p-4 hover:border-primary/50 hover:bg-card/80 transition-all group"
        >
            <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${statusColors[match.status] || "bg-secondary text-muted-foreground"}`}>
                    {match.status === "running" ? "LIVE" : match.status === "finished" ? "Finished" : "Upcoming"}
                </span>
                {match.scheduled_at && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(match.scheduled_at).toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Team 1 */}
                <div className="flex-1 flex items-center justify-end gap-3 text-right">
                    <span className="text-sm font-bold text-foreground truncate">{team1?.name || "TBD"}</span>
                    {team1?.image_url ? (
                        <Image src={team1.image_url} alt={team1.name} width={36} height={36} className="object-contain" />
                    ) : (
                        <div className="w-9 h-9 bg-secondary rounded flex items-center justify-center text-xs font-bold text-muted-foreground">{team1?.acronym || "?"}</div>
                    )}
                </div>

                {/* Score */}
                <div className={`px-4 py-1.5 rounded-lg font-mono font-bold text-sm border ${match.status === "running" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-secondary/50 text-foreground border-card-border"}`}>
                    {score1 ?? "-"} : {score2 ?? "-"}
                </div>

                {/* Team 2 */}
                <div className="flex-1 flex items-center justify-start gap-3 text-left">
                    {team2?.image_url ? (
                        <Image src={team2.image_url} alt={team2.name} width={36} height={36} className="object-contain" />
                    ) : (
                        <div className="w-9 h-9 bg-secondary rounded flex items-center justify-center text-xs font-bold text-muted-foreground">{team2?.acronym || "?"}</div>
                    )}
                    <span className="text-sm font-bold text-foreground truncate">{team2?.name || "TBD"}</span>
                </div>
            </div>
        </Link>
    );
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [tournament, setTournament] = useState<TournamentFull | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"list" | "bracket">("list");
    const [filter, setFilter] = useState<"all" | "running" | "upcoming" | "finished">("all");

    useEffect(() => {
        async function fetchData() {
            try {
                const [tRes, mRes] = await Promise.all([
                    fetch(`/api/tournaments/${id}`),
                    fetch(`/api/tournaments/${id}/matches`),
                ]);
                if (tRes.ok) setTournament(await tRes.json());
                if (mRes.ok) setMatches(await mRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const filteredMatches = matches.filter((m) => {
        if (filter === "all") return true;
        if (filter === "running") return m.status === "running";
        if (filter === "upcoming") return m.status === "not_started";
        return m.status === "finished";
    });

    // Extract unique teams
    const participatingTeams = Array.from(new Set(matches.flatMap(m => m.opponents.map(o => JSON.stringify(o.opponent))))).map(s => JSON.parse(s)).filter(t => t);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-card/30 border-b border-card-border sticky top-14 z-30 backdrop-blur-sm">
                <div className="container-custom py-6">
                    <Breadcrumbs
                        items={[
                            { label: "Tournaments", href: "/tournaments" },
                            { label: getTournamentDisplayName(tournament) }
                        ]}
                        className="mb-6"
                    />

                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="relative w-24 h-24 flex-shrink-0 bg-secondary/50 rounded-2xl border border-card-border p-4">
                            {tournament?.league?.image_url ? (
                                <Image src={tournament.league.image_url} alt="" fill className="object-contain p-2" />
                            ) : (
                                <Trophy className="w-full h-full text-muted-foreground" />
                            )}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-display font-bold text-foreground mb-2 uppercase tracking-wide">
                                {getTournamentDisplayName(tournament)}
                            </h1>
                            {/* {tournament?.serie?.full_name && <p className="text-lg text-muted-foreground mb-4">{tournament.serie.full_name}</p>} */}
                            {/* Remove redundant subtitle if it's integrated in the title, or keep it if different. 
                                Let's check: if title is "ESL Pro League Season 18 Playoffs", displaying "Season 18" in subtitle is distinct. 
                                But usually we want just one nice header. Let's keep it clean.
                            */}

                            <div className="flex flex-wrap gap-3">
                                {tournament?.tier && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-full uppercase tracking-wider">
                                        <Trophy className="w-3.5 h-3.5" />
                                        {tournament.tier} Tier
                                    </div>
                                )}
                                {tournament?.prizepool && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold rounded-full">
                                        <Coins className="w-3.5 h-3.5" />
                                        {tournament.prizepool}
                                    </div>
                                )}
                                {tournament?.begin_at && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary text-muted-foreground border border-card-border text-xs font-medium rounded-full">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(tournament.begin_at).toLocaleDateString("fr-FR")}
                                        {tournament.end_at && ` - ${new Date(tournament.end_at).toLocaleDateString("fr-FR")}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Phases Navigation */}
                    {(tournament as any)?.phases && (tournament as any).phases.length > 1 && (
                        <div className="mt-8 pt-4 border-t border-card-border/50">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <GitMerge className="w-3.5 h-3.5" />
                                Tournament Stages
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(tournament as any).phases.map((phase: any) => {
                                    const isActive = phase.id === tournament?.id;
                                    return (
                                        <Link
                                            key={phase.id}
                                            href={`/tournaments/${phase.slug || phase.id}`}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${isActive
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : "bg-secondary/50 text-muted-foreground border-card-border hover:bg-secondary hover:text-foreground"
                                                }`}
                                        >
                                            {phase.name}
                                            <span className={`ml-2 text-[10px] uppercase ${isActive ? "text-primary/70" : "text-muted-foreground/50"}`}>
                                                {phase.status === "running" ? "Live" : phase.status === "finished" ? "Finished" : "Upcoming"}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Participating Teams */}
                {participatingTeams.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-lg font-bold font-display uppercase mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            Participating Teams
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {participatingTeams.map((team: any) => (
                                <Link
                                    key={team.id}
                                    href={`/teams/${team.id}`}
                                    className="flex items-center gap-3 p-3 bg-card border border-card-border rounded-xl hover:border-primary/50 transition-all group min-w-[200px]"
                                >
                                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center p-1">
                                        {(team.dark_image_url || team.image_url) ? (
                                            <Image src={team.dark_image_url || team.image_url} alt={team.name} width={32} height={32} className="object-contain" />
                                        ) : (
                                            <span className="font-bold text-muted-foreground text-xs">{team.acronym}</span>
                                        )}
                                    </div>
                                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">{team.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* View Toggles */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { id: "all", label: "All", icon: Trophy, count: matches.length },
                            { id: "running", label: "Ongoing", icon: Play, count: matches.filter(m => m.status === "running").length },
                            { id: "upcoming", label: "Upcoming", icon: Clock, count: matches.filter(m => m.status === "not_started").length },
                            { id: "finished", label: "Finished", icon: CheckCircle, count: matches.filter(m => m.status === "finished").length },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = filter === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setFilter(item.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap border ${isActive
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card border-card-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary-foreground/20" : "bg-secondary-foreground/10"}`}>
                                        {item.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex bg-secondary p-1 rounded-lg border border-card-border">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode("bracket")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'bracket' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <GitMerge className="w-4 h-4" />
                            Bracket
                        </button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    filteredMatches.length === 0 ? (
                        <div className="py-20 text-center border border-dashed border-card-border rounded-xl">
                            <p className="text-muted-foreground">No matches found for this filter</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredMatches.map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    )
                ) : (
                    /* Pass ALL matches to BracketView, or maybe filtered? Usually brackets show everything. */
                    /* But if user specifically filters for 'Upcoming', they might get partial bracket. */
                    /* Let's pass all matches for consistency, or filtered if they really want. */
                    /* Actually, a partial bracket is weird. Let's pass all matches but highlight? Or just pass all. */
                    /* User expects filters to apply. If I select "Running", I want to see running matches. */
                    /* But a bracket needs context. */
                    /* Compromise: Pass ALL matches to BracketView, but maybe highlight filtered? */
                    /* For now, just pass ALL matches to ensure structure is maintained.*/
                    <BracketView matches={matches} />
                )}
            </div>
        </div >
    );
}
