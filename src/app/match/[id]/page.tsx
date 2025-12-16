"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Calendar, Clock, Trophy, Map, Users, Tv, Swords, Activity, ArrowLeft,
    CheckCircle, XCircle, AlertCircle, PlayCircle
} from "lucide-react";

interface Player {
    id: number;
    name: string;
    first_name: string | null;
    last_name: string | null;
    nationality: string | null;
    image_url: string | null;
    role: string | null;
    age: number | null;
}

interface RecentMatch {
    id: number;
    opponent_name: string;
    opponent_image: string | null;
    scheduled_at: string;
    won: boolean;
    score: number;
    opponent_score: number;
}

interface H2HMatch {
    id: number;
    name: string;
    scheduled_at: string;
    winner_id: number | null;
    results: { team_id: number; score: number }[];
    league_name: string;
}

interface Match {
    id: number;
    name: string;
    status: string;
    scheduled_at: string | null;
    begin_at: string | null;
    end_at: string | null;
    number_of_games: number;
    match_type: string;
    forfeit: boolean;
    draw: boolean;
    winner_id: number | null;
    opponents: {
        type: string;
        opponent: {
            id: number;
            name: string;
            acronym: string | null;
            location: string | null;
            image_url: string | null;
        };
    }[];
    results: { team_id: number; score: number }[];
    games: {
        id: number;
        position: number;
        status: string;
        length: number | null;
        finished: boolean;
        winner: { id: number; type: string } | null;
    }[];
    streams: {
        main: boolean;
        language: string;
        raw_url: string;
        embed_url: string | null;
        official: boolean;
    }[];
    tournament: { id: number; name: string; tier: string; prizepool: string | null } | null;
    league: { id: number; name: string; image_url: string | null } | null;
    serie: { id: number; name: string | null; full_name: string | null } | null;
    videogame: { name: string; slug: string } | null;
    team1Roster: Player[];
    team2Roster: Player[];
    team1RecentForm: RecentMatch[];
    team2RecentForm: RecentMatch[];
    headToHead: H2HMatch[];
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMatch() {
            try {
                const res = await fetch(`/api/matches/${id}`);
                if (!res.ok) throw new Error("Match not found");
                setMatch(await res.json());
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error");
            } finally {
                setLoading(false);
            }
        }
        fetchMatch();
        const interval = setInterval(fetchMatch, 30000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center bg-destructive/5 p-8 rounded-xl border border-destructive/20">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium mb-4">{error || "Match non trouvé"}</p>
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Link>
                </div>
            </div>
        );
    }

    const team1 = match.opponents[0]?.opponent;
    const team2 = match.opponents[1]?.opponent;
    const score1 = match.results.find((r) => r.team_id === team1?.id)?.score ?? 0;
    const score2 = match.results.find((r) => r.team_id === team2?.id)?.score ?? 0;
    const isLive = match.status === "running";
    const isFinished = match.status === "finished";

    const statusColors: Record<string, { bg: string; text: string; label: string, icon: any }> = {
        running: { bg: "bg-red-500/10", text: "text-red-500", label: "EN DIRECT", icon: Activity },
        finished: { bg: "bg-secondary", text: "text-muted-foreground", label: "Terminé", icon: CheckCircle },
        not_started: { bg: "bg-primary/10", text: "text-primary", label: "À venir", icon: Calendar },
        canceled: { bg: "bg-secondary", text: "text-muted-foreground", label: "Annulé", icon: XCircle },
    };
    const statusInfo = statusColors[match.status] || statusColors.not_started;
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen pb-12 bg-background">
            {/* Header */}
            <div className="bg-card/50 border-b border-card-border">
                <div className="container-custom py-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Retour
                    </Link>

                    {/* League info */}
                    <div className="flex items-center gap-4 mb-8">
                        {match.league?.image_url ? (
                            <Image src={match.league.image_url} alt="" width={48} height={48} className="object-contain bg-secondary/50 rounded-lg p-1" />
                        ) : (
                            <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-muted-foreground" />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{match.league?.name}</p>
                            <h2 className="text-xl font-display font-bold text-foreground">{match.serie?.full_name || match.serie?.name}</h2>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${statusInfo.bg} ${statusInfo.text} border-current/20 ${isLive ? "animate-pulse" : ""}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusInfo.label}
                            </span>
                            {match.tournament?.tier && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-secondary text-foreground border border-card-border rounded-full">
                                    <Trophy className="w-3.5 h-3.5 text-primary" />
                                    {match.tournament.tier.toUpperCase()} Tier
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Teams & Score */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-8">
                        {/* Team 1 */}
                        <div className={`flex flex-col items-center gap-4 ${isFinished && match.winner_id !== team1?.id ? "opacity-60 grayscale" : ""}`}>
                            <div className="w-24 h-24 bg-secondary/30 rounded-2xl flex items-center justify-center p-4 border border-card-border hover:border-primary/50 transition-colors">
                                {team1?.image_url ?
                                    <Image src={team1.image_url} alt={team1.name} width={80} height={80} className="object-contain" />
                                    : <span className="text-3xl font-bold text-muted-foreground">?</span>
                                }
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold font-display tracking-wide">{team1?.name || "TBD"}</p>
                                {isFinished && match.winner_id === team1?.id && (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-1">
                                        <Trophy className="w-3 h-3" /> Vainqueur
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-6">
                                <span className={`text-6xl font-display font-bold ${match.winner_id === team1?.id ? "text-primary" : "text-foreground"}`}>{score1}</span>
                                <span className="text-2xl text-muted-foreground/50 font-light">vs</span>
                                <span className={`text-6xl font-display font-bold ${match.winner_id === team2?.id ? "text-primary" : "text-foreground"}`}>{score2}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-card-border">
                                <Clock className="w-3.5 h-3.5" />
                                {match.scheduled_at && new Date(match.scheduled_at).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>

                        {/* Team 2 */}
                        <div className={`flex flex-col items-center gap-4 ${isFinished && match.winner_id !== team2?.id ? "opacity-60 grayscale" : ""}`}>
                            <div className="w-24 h-24 bg-secondary/30 rounded-2xl flex items-center justify-center p-4 border border-card-border hover:border-primary/50 transition-colors">
                                {team2?.image_url ?
                                    <Image src={team2.image_url} alt={team2.name} width={80} height={80} className="object-contain" />
                                    : <span className="text-3xl font-bold text-muted-foreground">?</span>
                                }
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold font-display tracking-wide">{team2?.name || "TBD"}</p>
                                {isFinished && match.winner_id === team2?.id && (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-1">
                                        <Trophy className="w-3 h-3" /> Vainqueur
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground border-t border-card-border pt-6 mt-4 flex-wrap">
                        <span className="inline-flex items-center gap-2">
                            <Swords className="w-4 h-4 text-primary" />
                            BO{match.number_of_games}
                        </span>
                        {match.tournament?.prizepool && (
                            <span className="inline-flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                {match.tournament.prizepool}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="container-custom py-8 space-y-8">
                {/* Games */}
                {match.games.length > 0 && (
                    <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                        <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <Map className="w-5 h-5 text-primary" />
                            Maps ({match.games.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {match.games.map((game) => {
                                const team1Won = game.winner?.id === team1?.id;
                                const team2Won = game.winner?.id === team2?.id;
                                return (
                                    <div key={game.id} className="bg-background rounded-lg p-4 border border-card-border hover:border-primary/30 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Map {game.position}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${game.status === "finished" ? "bg-secondary text-muted-foreground border-card-border" : game.status === "running" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-card border-card-border text-muted-foreground"}`}>
                                                {game.status === "finished" ? "Terminé" : game.status === "running" ? "LIVE" : "-"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium mb-1">
                                            <span className={team1Won ? "text-primary font-bold" : "text-foreground"}>{team1?.acronym || "T1"}</span>
                                            <span className={team2Won ? "text-primary font-bold" : "text-foreground"}>{team2?.acronym || "T2"}</span>
                                        </div>
                                        {game.length && (
                                            <div className="mt-3 pt-3 border-t border-card-border flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {formatDuration(game.length)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Rosters */}
                {(match.team1Roster.length > 0 || match.team2Roster.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[{ roster: match.team1Roster, team: team1 }, { roster: match.team2Roster, team: team2 }].map(({ roster, team }, idx) => (
                            roster.length > 0 && (
                                <div key={idx} className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                                    <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-3">
                                        {team?.image_url ? (
                                            <Image src={team.image_url} alt="" width={24} height={24} className="object-contain" />
                                        ) : <Users className="w-5 h-5 text-primary" />}
                                        Roster {team?.name}
                                    </h2>
                                    <div className="space-y-3">
                                        {roster.map((player) => (
                                            <div key={player.id} className="flex items-center gap-4 p-3 bg-background/50 border border-card-border rounded-lg hover:bg-background transition-colors group">
                                                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center overflow-hidden border border-card-border">
                                                    {player.image_url ?
                                                        <Image src={player.image_url} alt="" width={40} height={40} className="object-cover" />
                                                        : <span className="text-sm font-bold text-muted-foreground">{player.name?.[0]}</span>
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{player.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                        {player.nationality && <span className="text-[10px] font-mono px-1 bg-secondary rounded text-foreground">{player.nationality.toUpperCase()}</span>}
                                                        {player.first_name} {player.last_name}
                                                    </p>
                                                </div>
                                                {player.role && <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded uppercase">{player.role}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}

                {/* Recent Form */}
                {(match.team1RecentForm.length > 0 || match.team2RecentForm.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[{ form: match.team1RecentForm, team: team1 }, { form: match.team2RecentForm, team: team2 }].map(({ form, team }, idx) => (
                            form.length > 0 && (
                                <div key={idx} className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                                    <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        Forme récente - {team?.name}
                                    </h2>
                                    <div className="flex gap-2 mb-6">
                                        {form.map((m) => (
                                            <div key={m.id} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${m.won ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                                {m.won ? "W" : "L"}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        {form.map((m) => (
                                            <div key={m.id} className="flex items-center justify-between p-2 bg-background/30 rounded text-sm">
                                                <span className="text-xs text-muted-foreground w-20">{new Date(m.scheduled_at).toLocaleDateString("fr-FR")}</span>
                                                <span className="font-medium truncate flex-1 mx-2">{m.opponent_name}</span>
                                                <span className={`font-mono font-bold ${m.won ? "text-green-500" : "text-red-500"}`}>{m.score}-{m.opponent_score}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}

                {/* Head to Head */}
                {match.headToHead.length > 0 && (
                    <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                        <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <Swords className="w-5 h-5 text-primary" />
                            Face à Face ({match.headToHead.length} derniers matchs)
                        </h2>
                        <div className="space-y-2">
                            {match.headToHead.map((h2h) => {
                                const t1Score = h2h.results.find((r) => r.team_id === team1?.id)?.score ?? 0;
                                const t2Score = h2h.results.find((r) => r.team_id === team2?.id)?.score ?? 0;
                                const t1Won = h2h.winner_id === team1?.id;
                                const t2Won = h2h.winner_id === team2?.id;
                                return (
                                    <div key={h2h.id} className="flex items-center justify-between p-3 bg-background/50 border border-card-border rounded-lg text-sm hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">{new Date(h2h.scheduled_at).toLocaleDateString("fr-FR")}</span>
                                            <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wide px-2 py-0.5 bg-secondary rounded">{h2h.league_name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={t1Won ? "text-primary font-bold" : "text-foreground"}>{team1?.acronym || "T1"}</span>
                                            <span className="font-mono font-bold px-2 py-0.5 bg-secondary rounded">{t1Score} - {t2Score}</span>
                                            <span className={t2Won ? "text-primary font-bold" : "text-foreground"}>{team2?.acronym || "T2"}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Streams */}
                {match.streams.length > 0 && (
                    <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                        <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <Tv className="w-5 h-5 text-primary" />
                            Streams
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {match.streams.map((stream, idx) => (
                                <a key={idx} href={stream.raw_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-background border border-card-border rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <PlayCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{stream.language?.toUpperCase()} {stream.main && "(Main)"}</p>
                                        <p className="text-xs text-muted-foreground">{stream.official ? "Officiel" : "Non-officiel"}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
