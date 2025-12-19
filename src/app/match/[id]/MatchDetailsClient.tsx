"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Calendar, Clock, Trophy, Map, Users, Tv, Swords, Activity, ArrowLeft,
    CheckCircle, XCircle, PlayCircle, TrendingUp, Coins
} from "lucide-react";

import { StreamPlayer } from "@/components/match/StreamPlayer";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { BetModal, CurrentBetDisplay } from "@/components/betting";
import { useSession } from "@/lib/auth-client";
import type { Match } from "@/types";


function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MatchDetailsClient({ match: initialMatch }: { match: Match | any }) {
    const [match, setMatch] = useState(initialMatch);
    const [showBetModal, setShowBetModal] = useState(false);
    const { data: session } = useSession();

    // Polling logic for live matches could go here if needed
    // For SEO purposes, initialMatch is critical.

    useEffect(() => {
        if (match.status === "running") {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/matches/${match.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setMatch(data);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [match.id, match.status]);

    const team1 = match.opponents[0]?.opponent;
    const team2 = match.opponents[1]?.opponent;
    const score1 = match.results.find((r: any) => r.team_id === team1?.id)?.score ?? 0;
    const score2 = match.results.find((r: any) => r.team_id === team2?.id)?.score ?? 0;
    const isLive = match.status === "running";
    const isFinished = match.status === "finished";
    const isBettable = match.status === "not_started" && team1 && team2;

    const statusColors: Record<string, { bg: string; text: string; label: string, icon: any }> = {
        running: { bg: "bg-red-500/10", text: "text-red-500", label: "EN DIRECT", icon: Activity },
        finished: { bg: "bg-secondary", text: "text-muted-foreground", label: "Terminé", icon: CheckCircle },
        not_started: { bg: "bg-primary/10", text: "text-primary", label: "À venir", icon: Calendar },
        canceled: { bg: "bg-secondary", text: "text-muted-foreground", label: "Annulé", icon: XCircle },
    };
    const statusInfo = statusColors[match.status] || statusColors.not_started;
    const StatusIcon = statusInfo.icon;

    // Fix: Find best stream
    // Prioritize: Official Main > Official English > Official Other > Non-official Main
    // Or just Official > others.
    const getBestStream = (streams: any[]) => {
        if (!streams || streams.length === 0) return null;
        return streams.sort((a: any, b: any) => {
            if (a.official !== b.official) return a.official ? -1 : 1;
            if (a.main !== b.main) return a.main ? -1 : 1;
            if (a.language === "en" && b.language !== "en") return -1;
            return 0;
        })[0];
    };

    const [activeStream, setActiveStream] = useState<any>(null);

    useEffect(() => {
        if (match.streams?.length > 0 && !activeStream) {
            setActiveStream(getBestStream([...match.streams]));
        }
    }, [match.streams, activeStream]);

    return (
        <div className="min-h-screen pb-12 bg-background">
            {/* Header */}
            <div className="bg-card/50 border-b border-card-border">
                <div className="container-custom py-8">
                    {/* Stream Embed - Only if Live */}
                    {isLive && activeStream && (
                        <div className="mb-6 animate-in fade-in zoom-in duration-500">
                            <StreamPlayer stream={activeStream} />

                            {/* Stream Selector */}
                            {match.streams.length > 1 && (
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                    <span className="text-xs font-medium text-muted-foreground mr-2">Select Stream:</span>
                                    {match.streams.map((stream: any, idx: number) => (
                                        <button
                                            key={`${stream.raw_url}-${idx}`}
                                            onClick={() => setActiveStream(stream)}
                                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${activeStream.raw_url === stream.raw_url
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                                : "bg-card text-muted-foreground border-card-border hover:border-primary/50 hover:text-foreground"
                                                }`}
                                        >
                                            <span className="uppercase">{stream.language || "Other"}</span>
                                            {stream.main && <span className="text-[10px] opacity-80">★</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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
                            {team1 ? (
                                <Link href={`/teams/${team1.id}`} className="group flex flex-col items-center gap-4 transition-transform hover:scale-105">
                                    <div className="w-24 h-24 bg-secondary/30 rounded-2xl flex items-center justify-center p-4 border border-card-border group-hover:border-primary/50 transition-colors shadow-lg group-hover:shadow-primary/10">
                                        {team1.image_url ? (
                                            <Image src={team1.image_url} alt={team1.name} width={80} height={80} className="object-contain" />
                                        ) : (
                                            <span className="text-3xl font-bold text-muted-foreground">?</span>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold font-display tracking-wide group-hover:text-primary transition-colors">{team1.name}</p>
                                        {isFinished && match.winner_id === team1.id && (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-1">
                                                <Trophy className="w-3 h-3" /> Vainqueur
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 h-24 bg-secondary/30 rounded-2xl flex items-center justify-center p-4 border border-card-border">
                                        <span className="text-3xl font-bold text-muted-foreground">?</span>
                                    </div>
                                    <p className="text-xl font-bold font-display tracking-wide">TBD</p>
                                </div>
                            )}
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
                            {team2 ? (
                                <Link href={`/teams/${team2.id}`} className="group flex flex-col items-center gap-4 transition-transform hover:scale-105">
                                    <div className="w-24 h-24 bg-secondary/30 rounded-2xl flex items-center justify-center p-4 border border-card-border group-hover:border-primary/50 transition-colors shadow-lg group-hover:shadow-primary/10">
                                        {team2.image_url ? (
                                            <Image src={team2.image_url} alt={team2.name} width={80} height={80} className="object-contain" />
                                        ) : (
                                            <span className="text-3xl font-bold text-muted-foreground">?</span>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold font-display tracking-wide group-hover:text-primary transition-colors">{team2.name}</p>
                                        {isFinished && match.winner_id === team2.id && (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-1">
                                                <Trophy className="w-3 h-3" /> Vainqueur
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 h-24 bg-secondary/30 rounded-2xl flex items-center justify-center p-4 border border-card-border">
                                        <span className="text-3xl font-bold text-muted-foreground">?</span>
                                    </div>
                                    <p className="text-xl font-bold font-display tracking-wide">TBD</p>
                                </div>
                            )}
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

                        {/* Bet Button */}
                        {isBettable && session?.user && (
                            <button
                                onClick={() => setShowBetModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition-all hover:scale-105 shadow-lg shadow-yellow-500/20"
                            >
                                <TrendingUp className="w-4 h-4" />
                                Parier
                                <Coins className="w-4 h-4" />
                            </button>
                        )}
                        {isBettable && !session?.user && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-xs">
                                <TrendingUp className="w-4 h-4" />
                                Connecte-toi pour parier
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="container-custom py-8 space-y-8">
                {/* Current Bet Display */}
                {team1 && team2 && (
                    <CurrentBetDisplay
                        matchId={match.id}
                        teams={[
                            { id: team1.id, name: team1.name, acronym: team1.acronym, image_url: team1.image_url },
                            { id: team2.id, name: team2.name, acronym: team2.acronym, image_url: team2.image_url },
                        ]}
                    />
                )}

                {/* Games with Stats */}
                {match.gamesWithStats && match.gamesWithStats.length > 0 ? (
                    <div className="space-y-6">
                        <h2 className="font-display font-bold text-lg flex items-center gap-2">
                            <Map className="w-5 h-5 text-primary" />
                            Maps ({match.gamesWithStats.length})
                        </h2>
                        {match.gamesWithStats.map((game: any) => {
                            const gameTeam1 = game.teams.find((t: any) => t.team_id === team1?.id);
                            const gameTeam2 = game.teams.find((t: any) => t.team_id === team2?.id);
                            const team1Players = game.players.filter((p: any) => p.team_id === team1?.id);
                            const team2Players = game.players.filter((p: any) => p.team_id === team2?.id);
                            const team1Won = game.winner?.id === team1?.id;
                            const team2Won = game.winner?.id === team2?.id;

                            return (
                                <div key={game.id} className="bg-card border border-card-border rounded-xl overflow-hidden shadow-sm">
                                    {/* Map Header */}
                                    <div className="bg-secondary/30 p-4 border-b border-card-border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Map {game.position}</span>
                                                {game.map && (
                                                    <span className="text-sm font-bold text-primary">{game.map.name}</span>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${game.status === "finished" ? "bg-secondary text-muted-foreground border-card-border" : game.status === "running" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-card border-card-border text-muted-foreground"}`}>
                                                {game.status === "finished" ? "Terminé" : game.status === "running" ? "LIVE" : "-"}
                                            </span>
                                        </div>

                                        {/* Score by Half */}
                                        <div className="mt-4 flex items-center justify-center gap-8">
                                            <div className={`text-center ${team1Won ? 'opacity-100' : 'opacity-70'}`}>
                                                <span className="text-2xl font-bold font-display">{gameTeam1?.score ?? '-'}</span>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    ({gameTeam1?.first_half_score ?? 0} + {gameTeam1?.second_half_score ?? 0}{gameTeam1?.overtime_score ? ` +${gameTeam1.overtime_score}` : ''})
                                                </div>
                                            </div>
                                            <span className="text-muted-foreground/50">vs</span>
                                            <div className={`text-center ${team2Won ? 'opacity-100' : 'opacity-70'}`}>
                                                <span className="text-2xl font-bold font-display">{gameTeam2?.score ?? '-'}</span>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    ({gameTeam2?.first_half_score ?? 0} + {gameTeam2?.second_half_score ?? 0}{gameTeam2?.overtime_score ? ` +${gameTeam2.overtime_score}` : ''})
                                                </div>
                                            </div>
                                        </div>
                                        {game.length && (
                                            <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {formatDuration(game.length)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Player Stats Table */}
                                    {game.players.length > 0 && (
                                        <div className="p-4 space-y-4">
                                            {[{ players: team1Players, team: team1, isWinner: team1Won }, { players: team2Players, team: team2, isWinner: team2Won }].map(({ players, team, isWinner }: any, idx: number) => (
                                                players.length > 0 && (
                                                    <div key={idx}>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            {team?.image_url && (
                                                                <Image src={team.image_url} alt="" width={20} height={20} className="object-contain" />
                                                            )}
                                                            <span className={`text-sm font-bold ${isWinner ? 'text-primary' : 'text-foreground'}`}>
                                                                {team?.name}
                                                            </span>
                                                        </div>
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-xs">
                                                                <thead>
                                                                    <tr className="text-muted-foreground border-b border-card-border">
                                                                        <th className="text-left py-2 px-2 font-medium">Player</th>
                                                                        <th className="text-left py-2 px-2 font-medium hidden lg:table-cell">Role</th>
                                                                        <th className="text-center py-2 px-2 font-medium">K</th>
                                                                        <th className="text-center py-2 px-2 font-medium">D</th>
                                                                        <th className="text-center py-2 px-2 font-medium">A</th>
                                                                        <th className="text-center py-2 px-2 font-medium">+/-</th>
                                                                        <th className="text-center py-2 px-2 font-medium hidden sm:table-cell">ADR</th>
                                                                        <th className="text-center py-2 px-2 font-medium hidden md:table-cell">KAST</th>
                                                                        <th className="text-center py-2 px-2 font-medium">Rating</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {players.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)).map((p: any) => (
                                                                        <tr key={p.player_id} className="border-b border-card-border/50 last:border-0">
                                                                            <td className="py-2 px-2 font-medium text-foreground">{p.player_name}</td>
                                                                            <td className="py-2 px-2 hidden lg:table-cell">
                                                                                {p.role && <RoleBadge role={p.role} />}
                                                                            </td>
                                                                            <td className="py-2 px-2 text-center text-green-500 font-mono">{p.kills ?? '-'}</td>
                                                                            <td className="py-2 px-2 text-center text-red-500 font-mono">{p.deaths ?? '-'}</td>
                                                                            <td className="py-2 px-2 text-center text-muted-foreground font-mono">{p.assists ?? '-'}</td>
                                                                            <td className={`py-2 px-2 text-center font-mono ${(p.kills - p.deaths) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                                {(p.kills - p.deaths) >= 0 ? '+' : ''}{p.kills - p.deaths}
                                                                            </td>
                                                                            <td className="py-2 px-2 text-center text-muted-foreground font-mono hidden sm:table-cell">
                                                                                {p.adr ? p.adr.toFixed(1) : '-'}
                                                                            </td>
                                                                            <td className="py-2 px-2 text-center text-muted-foreground font-mono hidden md:table-cell">
                                                                                {p.kast ? `${(p.kast * 100).toFixed(0)}%` : '-'}
                                                                            </td>
                                                                            <td className={`py-2 px-2 text-center font-bold font-mono ${p.rating >= 1.2 ? 'text-green-500' : p.rating >= 1.0 ? 'text-foreground' : 'text-red-500'}`}>
                                                                                {p.rating ? p.rating.toFixed(2) : '-'}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : match.games.length > 0 && (
                    /* Fallback to basic games display */
                    <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                        <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <Map className="w-5 h-5 text-primary" />
                            Maps ({match.games.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {match.games.map((game: any) => {
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
                        {[{ roster: match.team1Roster, team: team1 }, { roster: match.team2Roster, team: team2 }].map(({ roster, team }: any, idx: number) => (
                            roster.length > 0 && (
                                <div key={idx} className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                                    <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-3">
                                        {team?.image_url ? (
                                            <Image src={team.image_url} alt="" width={24} height={24} className="object-contain" />
                                        ) : <Users className="w-5 h-5 text-primary" />}
                                        Roster {team?.name}
                                    </h2>
                                    <div className="space-y-3">
                                        {roster.map((player: any) => (
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
                                                {player.role && <RoleBadge role={player.role} size="md" />}
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
                        {[{ form: match.team1RecentForm, team: team1 }, { form: match.team2RecentForm, team: team2 }].map(({ form, team }: any, idx: number) => (
                            form.length > 0 && (
                                <div key={idx} className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                                    <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        Forme récente - {team?.name}
                                    </h2>
                                    <div className="flex gap-2 mb-6">
                                        {form.map((m: any) => (
                                            <div key={m.id} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${m.won ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                                {m.won ? "W" : "L"}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        {form.map((m: any) => (
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
                            {match.headToHead.map((h2h: any) => {
                                const t1Score = h2h.results.find((r: any) => r.team_id === team1?.id)?.score ?? 0;
                                const t2Score = h2h.results.find((r: any) => r.team_id === team2?.id)?.score ?? 0;
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

                {/* Streams & Replays */}
                {(match.streams.length > 0 || isFinished) && (
                    <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                        <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <Tv className="w-5 h-5 text-primary" />
                            Streams & Replays
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {match.streams.map((stream: any, idx: number) => (
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

                            {/* Replay Search Button */}
                            {isFinished && (
                                <a
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${team1?.name || "Team 1"} vs ${team2?.name || "Team 2"} ${match.league?.name || ""} ${match.serie?.full_name || ""} replay`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl hover:bg-red-600/20 hover:border-red-600/50 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                        <PlayCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-red-500">Search Replay</p>
                                        <p className="text-xs text-muted-foreground">on YouTube</p>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bet Modal */}
            {isBettable && (
                <BetModal
                    isOpen={showBetModal}
                    onClose={() => setShowBetModal(false)}
                    matchId={match.id}
                    teams={[
                        { id: team1.id, name: team1.name, acronym: team1.acronym, image_url: team1.image_url },
                        { id: team2.id, name: team2.name, acronym: team2.acronym, image_url: team2.image_url },
                    ]}
                    matchName={`${team1.name || team1.acronym} vs ${team2.name || team2.acronym}`}
                    matchTier={match.tier}
                    tournamentTier={match.tournament?.tier}
                    onBetPlaced={() => {
                        // Could update local state or refresh session here
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

