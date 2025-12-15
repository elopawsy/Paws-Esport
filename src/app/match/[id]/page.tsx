"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";

interface Veto {
    id: number;
    team: { id: number; name: string } | null;
    type: "ban" | "pick" | "decider";
    map: { name: string };
}

interface GameRound {
    round: number;
    score_ct: number;
    score_t: number;
    ct_winner: boolean;
    t_winner: boolean;
    win_type: string;
}

interface Team {
    id: number;
    name: string;
    acronym: string;
    location: string;
    image_url: string | null;
    players?: any[];
}

interface Game {
    id: number;
    position: number;
    status: string;
    map: string | null;
    length: number | null;
    winner_id: number | null;
    winner_name: string | null;
    teams: {
        team_id: number;
        name: string;
        first_half_score: number;
        second_half_score: number;
        overtime_score: number;
        total_score: number;
    }[];
    playerStats: {
        player_id: number;
        name: string;
        team_id: number;
        kills: number;
        deaths: number;
        assists: number;
        adr: number;
        kd: string;
        rating: string;
    }[];
    rounds?: GameRound[]; // Added rounds
}

interface Stream {
    main: boolean;
    language: string;
    raw_url: string;
    embed_url: string;
    official: boolean;
}

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
    opponent_logo: string | null;
    scheduled_at: string;
    winner_id: number | null;
    won: boolean;
    score: number;
    opponent_score: number;
}

interface HeadToHeadMatch {
    id: number;
    name: string;
    scheduled_at: string;
    winner_id: number | null;
    results: { team_id: number; score: number }[];
    league_name: string;
    serie_name: string;
}

interface PlayerStats {
    player_id: number;
    name: string;
    team_id: number;
    kills: number;
    deaths: number;
    assists: number;
    headshots: number;
    adr: number;
    kd_ratio: number;
    kda_ratio: number;
    hs_percentage: number;
    rating: number;
}

interface MatchDetails {
    id: number;
    name: string;
    status: "not_started" | "running" | "finished" | "canceled";
    scheduled_at: string;
    begin_at: string | null;
    end_at: string | null;
    number_of_games: number;
    match_type: string;
    detailed_stats: boolean;
    draw: boolean;
    forfeit: boolean;
    rescheduled: boolean;
    winner_id: number | null;
    opponents: { type: string; opponent: Team }[];
    results: { team_id: number; score: number }[];
    league: {
        id: number;
        name: string;
        image_url: string | null;
        url: string | null;
    } | null;
    serie: {
        id: number;
        name: string;
        full_name: string;
        year: number;
        season: string;
    } | null;
    tournament: {
        id: number;
        name: string;
        tier: string;
        type: string;
        prizepool: string | null;
        country: string | null;
        region: string;
        begin_at: string;
        end_at: string;
    } | null;
    tier: string;
    streams: Stream[];
    games: Game[];
    team1Roster: Player[];
    team2Roster: Player[];
    headToHead: HeadToHeadMatch[];
    team1RecentForm: RecentMatch[];
    team2RecentForm: RecentMatch[];
    playerStats: PlayerStats[];
    vetos: Veto[];
}

export default function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [match, setMatch] = useState<MatchDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedMapId, setExpandedMapId] = useState<number | null>(null);

    const toggleMap = (id: number) => {
        setExpandedMapId(expandedMapId === id ? null : id);
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        async function fetchMatch() {
            try {
                const res = await fetch(`/api/matches/${resolvedParams.id}`);
                if (!res.ok) throw new Error("Match not found");
                const data = await res.json();
                setMatch(data);

                // If match is finished or canceled, stop polling
                if (data.status === "finished" || data.status === "canceled") {
                    clearInterval(intervalId);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load match");
            } finally {
                setLoading(false);
            }
        }

        fetchMatch();

        // Poll every 30 seconds for live updates
        intervalId = setInterval(fetchMatch, 30000);

        return () => clearInterval(intervalId);
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="container-custom py-16">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-card w-1/3 rounded" />
                    <div className="h-64 bg-card rounded" />
                    <div className="h-32 bg-card rounded" />
                </div>
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className="container-custom py-16">
                <div className="text-center py-20 bg-red-500/5 rounded border border-red-500/20">
                    <p className="text-red-400 font-mono text-sm uppercase mb-4">{error || "Match not found"}</p>
                    <Link href="/" className="text-sm text-red-400 underline decoration-1 underline-offset-4 hover:text-white">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    const team1 = match.opponents[0]?.opponent;
    const team2 = match.opponents[1]?.opponent;
    const score1 = match.results.find(r => r.team_id === team1?.id)?.score || 0;
    const score2 = match.results.find(r => r.team_id === team2?.id)?.score || 0;
    const winner = match.winner_id;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusBadge = () => {
        switch (match.status) {
            case "running":
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium uppercase">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        En Direct
                    </span>
                );
            case "finished":
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium uppercase">
                        Terminé
                    </span>
                );
            case "canceled":
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium uppercase">
                        Annulé
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium uppercase">
                        À venir
                    </span>
                );
        }
    };

    const getTierBadge = () => {
        const tierClass = match.tier === "Tier 1"
            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            : match.tier === "Tier 2"
                ? "bg-gray-400/20 text-gray-300 border-gray-400/30"
                : "bg-orange-500/20 text-orange-400 border-orange-500/30";

        return (
            <span className={`px-3 py-1 text-xs font-medium uppercase rounded-full border ${tierClass}`}>
                {match.tier}
            </span>
        );
    };

    return (
        <div className="container-custom py-8">
            {/* Back Button */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8 text-sm"
            >
                <span>←</span> Retour aux matchs
            </Link>

            {/* Match Header */}
            <div className="bg-card border border-card-border rounded-lg p-8 mb-8">
                {/* League & Tournament Info */}
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                    {match.league?.image_url && (
                        <Image
                            src={match.league.image_url}
                            alt={match.league.name}
                            width={40}
                            height={40}
                            className="rounded"
                        />
                    )}
                    <div>
                        <p className="text-sm text-muted">{match.league?.name}</p>
                        <p className="text-lg font-semibold text-foreground">
                            {match.serie?.full_name || match.serie?.name}
                            {match.tournament?.name && ` • ${match.tournament.name}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        {getStatusBadge()}
                        {getTierBadge()}
                    </div>
                </div>

                {/* Teams & Score */}
                <div className="flex items-center justify-center gap-8 py-8">
                    {/* Team 1 */}
                    <div className={`flex flex-col items-center gap-4 flex-1 ${winner === team1?.id ? "" : winner ? "opacity-50" : ""}`}>
                        <div className="w-24 h-24 bg-background rounded-lg flex items-center justify-center overflow-hidden">
                            {team1?.image_url ? (
                                <Image
                                    src={team1.image_url}
                                    alt={team1.name}
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-muted">
                                    {team1?.acronym?.[0] || team1?.name?.[0] || "?"}
                                </span>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-foreground">{team1?.name || "TBD"}</p>
                            {team1?.location && (
                                <p className="text-xs text-muted uppercase">{team1.location}</p>
                            )}
                        </div>
                        {winner === team1?.id && (
                            <span className="text-xs text-green-400 font-medium uppercase">🏆 Vainqueur</span>
                        )}
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-4">
                        <span className={`text-5xl font-bold ${winner === team1?.id ? "text-green-400" : "text-foreground"}`}>
                            {score1}
                        </span>
                        <span className="text-2xl text-muted">-</span>
                        <span className={`text-5xl font-bold ${winner === team2?.id ? "text-green-400" : "text-foreground"}`}>
                            {score2}
                        </span>
                    </div>

                    {/* Team 2 */}
                    <div className={`flex flex-col items-center gap-4 flex-1 ${winner === team2?.id ? "" : winner ? "opacity-50" : ""}`}>
                        <div className="w-24 h-24 bg-background rounded-lg flex items-center justify-center overflow-hidden">
                            {team2?.image_url ? (
                                <Image
                                    src={team2.image_url}
                                    alt={team2.name}
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-muted">
                                    {team2?.acronym?.[0] || team2?.name?.[0] || "?"}
                                </span>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-foreground">{team2?.name || "TBD"}</p>
                            {team2?.location && (
                                <p className="text-xs text-muted uppercase">{team2.location}</p>
                            )}
                        </div>
                        {winner === team2?.id && (
                            <span className="text-xs text-green-400 font-medium uppercase">🏆 Vainqueur</span>
                        )}
                    </div>
                </div>

                {/* Match Info */}
                <div className="flex items-center justify-center gap-8 text-sm text-muted border-t border-card-border pt-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formatDate(match.scheduled_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>🎮</span>
                        <span>BO{match.number_of_games}</span>
                    </div>
                    {match.tournament?.prizepool && (
                        <div className="flex items-center gap-2">
                            <span>💰</span>
                            <span>{match.tournament.prizepool}</span>
                        </div>
                    )}
                    {match.tournament?.region && (
                        <div className="flex items-center gap-2">
                            <span>🌍</span>
                            <span>{match.tournament.region}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Games/Maps */}
            <div className="bg-card border border-card-border rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-foreground uppercase mb-6">Maps</h2>
                {match.games.length > 0 ? (
                    <div className="space-y-4">
                        {match.games.map((game) => {
                            const gameTeam1 = game.teams.find(t => t.team_id === team1?.id);
                            const gameTeam2 = game.teams.find(t => t.team_id === team2?.id);
                            const gameWinner = game.winner_id;

                            return (
                                <div key={game.id} className="bg-background rounded-lg overflow-hidden transition-all">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-card/50"
                                        onClick={() => toggleMap(game.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-muted uppercase font-mono">Map {game.position}</span>
                                            {game.map && (
                                                <span className="text-sm font-medium text-foreground">{game.map}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className={`flex items-center gap-3 ${gameWinner === team1?.id ? "text-green-400" : "text-foreground"}`}>
                                                <span className="text-sm font-medium">{team1?.acronym || team1?.name}</span>
                                                <span className="text-xl font-bold">{gameTeam1?.total_score || 0}</span>
                                            </div>
                                            <span className="text-muted">-</span>
                                            <div className={`flex items-center gap-3 ${gameWinner === team2?.id ? "text-green-400" : "text-foreground"}`}>
                                                <span className="text-xl font-bold">{gameTeam2?.total_score || 0}</span>
                                                <span className="text-sm font-medium">{team2?.acronym || team2?.name}</span>
                                            </div>
                                            <span className="text-muted text-xs ml-2">{expandedMapId === game.id ? "▲" : "▼"}</span>
                                        </div>
                                    </div>

                                    {/* Expanded Stats */}
                                    {expandedMapId === game.id && (
                                        <div className="border-t border-card-border bg-card/10 p-4 animate-in slide-in-from-top-2 duration-200">
                                            {/* Round History */}
                                            {game.rounds && game.rounds.length > 0 && (
                                                <div className="mb-6 overflow-x-auto pb-2">
                                                    <h3 className="text-xs uppercase text-muted font-bold mb-2">Historique des Rounds</h3>
                                                    <div className="flex gap-1 min-w-max">
                                                        {game.rounds.sort((a, b) => a.round - b.round).map((round) => (
                                                            <div key={round.round} className="relative group">
                                                                <div className={`w-6 h-8 rounded flex items-center justify-center text-xs font-bold border ${round.ct_winner ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                                                    }`} title={`Round ${round.round}: ${round.win_type}`}>
                                                                    {round.win_type.includes("bomb") ? "💣" :
                                                                        round.win_type.includes("defuse") ? "✂️" :
                                                                            round.win_type.includes("time") ? "⏱️" : "💀"}
                                                                </div>
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/80 text-white text-[10px] px-1 rounded whitespace-nowrap z-10">
                                                                    R{round.round} ({round.ct_winner ? "CT" : "T"})
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Player Stats Table */}
                                            {game.playerStats && game.playerStats.length > 0 ? (
                                                <div className="bg-card/50 overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b border-card-border text-left text-xs uppercase text-muted">
                                                                <th className="p-3 font-medium">Joueur</th>
                                                                <th className="p-3 font-medium text-center">K</th>
                                                                <th className="p-3 font-medium text-center">D</th>
                                                                <th className="p-3 font-medium text-center">A</th>
                                                                <th className="p-3 font-medium text-center">+/-</th>
                                                                <th className="p-3 font-medium text-center">ADR</th>
                                                                <th className="p-3 font-medium text-center">Rating</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {/* Team 1 Players */}
                                                            {game.playerStats
                                                                .filter(p => p.team_id === team1?.id)
                                                                .map(player => (
                                                                    <tr key={player.player_id} className="border-b border-card-border last:border-0 hover:bg-card/80 transition-colors">
                                                                        <td className="p-3 font-medium text-foreground">{player.name}</td>
                                                                        <td className="p-3 text-center text-foreground">{player.kills}</td>
                                                                        <td className="p-3 text-center text-muted">{player.deaths}</td>
                                                                        <td className="p-3 text-center text-muted">{player.assists}</td>
                                                                        <td className={`p-3 text-center font-medium ${player.kills - player.deaths > 0 ? "text-green-400" : player.kills - player.deaths < 0 ? "text-red-400" : "text-muted"}`}>
                                                                            {player.kills - player.deaths > 0 ? "+" : ""}{player.kills - player.deaths}
                                                                        </td>
                                                                        <td className="p-3 text-center text-foreground">{player.adr}</td>
                                                                        <td className={`p-3 text-center font-bold ${parseFloat(player.rating) >= 1.1 ? "text-green-400" : parseFloat(player.rating) < 1.0 ? "text-red-400" : "text-yellow-400"}`}>{player.rating}</td>
                                                                    </tr>
                                                                ))}

                                                            {/* Team 2 Players */}
                                                            {game.playerStats
                                                                .filter(p => p.team_id === team2?.id)
                                                                .map(player => (
                                                                    <tr key={player.player_id} className="border-b border-card-border last:border-0 hover:bg-card/80 transition-colors">
                                                                        <td className="p-3 font-medium text-foreground">{player.name}</td>
                                                                        <td className="p-3 text-center text-foreground">{player.kills}</td>
                                                                        <td className="p-3 text-center text-muted">{player.deaths}</td>
                                                                        <td className="p-3 text-center text-muted">{player.assists}</td>
                                                                        <td className={`p-3 text-center font-medium ${player.kills - player.deaths > 0 ? "text-green-400" : player.kills - player.deaths < 0 ? "text-red-400" : "text-muted"}`}>
                                                                            {player.kills - player.deaths > 0 ? "+" : ""}{player.kills - player.deaths}
                                                                        </td>
                                                                        <td className="p-3 text-center text-foreground">{player.adr}</td>
                                                                        <td className={`p-3 text-center font-bold ${parseFloat(player.rating) >= 1.1 ? "text-green-400" : parseFloat(player.rating) < 1.0 ? "text-red-400" : "text-yellow-400"}`}>{player.rating}</td>
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center text-muted italic">
                                                    Statistiques détaillées non disponibles pour cette map.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted italic text-center text-sm py-4">Maps à définir ou non disponibles.</p>
                )}
            </div>

            {/* Streams */}
            {match.streams.length > 0 && (
                <div className="bg-card border border-card-border rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-foreground uppercase mb-6">Streams</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {match.streams.map((stream, index) => (
                            <a
                                key={index}
                                href={stream.raw_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-background rounded-lg hover:bg-card-border transition-colors"
                            >
                                <span className="text-2xl">📺</span>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {stream.language?.toUpperCase() || "Stream"}
                                        {stream.main && " (Principal)"}
                                    </p>
                                    <p className="text-xs text-muted">
                                        {stream.official ? "Officiel" : "Non-officiel"}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Tournament Info */}
            {match.tournament && (
                <div className="bg-card border border-card-border rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-foreground uppercase mb-6">Tournoi</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-xs text-muted uppercase mb-1">Nom</p>
                            <p className="text-sm font-medium text-foreground">{match.tournament.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted uppercase mb-1">Type</p>
                            <p className="text-sm font-medium text-foreground capitalize">{match.tournament.type}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted uppercase mb-1">Région</p>
                            <p className="text-sm font-medium text-foreground">{match.tournament.region}</p>
                        </div>
                        {match.tournament.prizepool && (
                            <div>
                                <p className="text-xs text-muted uppercase mb-1">Prize Pool</p>
                                <p className="text-sm font-medium text-foreground">{match.tournament.prizepool}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Vetoes Section */}
            {match.vetos && match.vetos.length > 0 && (
                <div className="bg-card border border-card-border rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-foreground uppercase mb-6 flex items-center gap-2">
                        Phase de Veto
                    </h2>
                    <div className="flex flex-wrap gap-3 items-center justify-center p-4 bg-background/30 rounded-lg">
                        {match.vetos.map((veto, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${veto.type === 'ban' ? 'bg-red-500/10 text-red-500' :
                                        veto.type === 'pick' ? 'bg-green-500/10 text-green-500' :
                                            'bg-gray-500/10 text-gray-400'
                                    }`}>
                                    {veto.type}
                                </span>
                                <div className="flex items-center gap-2 bg-background border border-card-border px-3 py-1.5 rounded text-sm font-medium">
                                    {veto.team && (
                                        <span className="text-muted text-xs">{veto.team.name}</span>
                                    )}
                                    <span className="text-foreground">{veto.map.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Team Stats Comparison */}
            <div className="bg-card border border-card-border rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-foreground uppercase mb-6">Comparaison des Équipes</h2>
                {match.playerStats && match.playerStats.length > 0 ? (
                    <div className="space-y-6">
                        {(() => {
                            const t1Stats = match.playerStats.filter(p => p.team_id === team1?.id);
                            const t2Stats = match.playerStats.filter(p => p.team_id === team2?.id);

                            const calculateTotal = (stats: any[], key: string) => stats.reduce((acc, curr) => acc + (curr[key] || 0), 0);
                            const calculateAvg = (stats: any[], key: string) => stats.length ? stats.reduce((acc, curr) => acc + (parseFloat(curr[key]) || 0), 0) / stats.length : 0;

                            const metrics = [
                                { label: "Total Kills", key: "kills", type: "total", format: (v: number) => v },
                                { label: "Total Deaths", key: "deaths", type: "total", format: (v: number) => v },
                                { label: "Total Assists", key: "assists", type: "total", format: (v: number) => v },
                                { label: "Average ADR", key: "adr", type: "avg", format: (v: number) => v.toFixed(1) },
                                { label: "Average Rating", key: "rating", type: "avg", format: (v: number) => v.toFixed(2) },
                            ];

                            return metrics.map((metric) => {
                                const t1Value = metric.type === "total" ? calculateTotal(t1Stats, metric.key) : calculateAvg(t1Stats, metric.key);
                                const t2Value = metric.type === "total" ? calculateTotal(t2Stats, metric.key) : calculateAvg(t2Stats, metric.key);
                                const total = t1Value + t2Value;
                                const t1Percent = total > 0 ? (t1Value / total) * 100 : 50;
                                const t2Percent = 100 - t1Percent;

                                return (
                                    <div key={metric.label} className="flex flex-col gap-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className={t1Value > t2Value ? "text-green-400" : "text-muted"}>{metric.format(t1Value)}</span>
                                            <span className="text-muted/70 uppercase text-xs">{metric.label}</span>
                                            <span className={t2Value > t1Value ? "text-green-400" : "text-muted"}>{metric.format(t2Value)}</span>
                                        </div>
                                        <div className="flex h-2 w-full rounded-full overflow-hidden bg-background/50">
                                            <div style={{ width: `${t1Percent}%` }} className={`h-full ${t1Value > t2Value ? "bg-green-500/80" : "bg-muted/30"}`} />
                                            <div style={{ width: `${t2Percent}%` }} className={`h-full ${t2Value > t1Value ? "bg-green-500/80" : "bg-muted/30"}`} />
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                ) : (
                    <p className="text-muted italic text-center text-sm py-4">Statistiques non disponibles pour ce match.</p>
                )}
            </div>

            {/* Team Rosters */}
            {(match.team1Roster?.length > 0 || match.team2Roster?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Team Stats Comparison */}


                    {/* Team 1 Roster */}
                    {match.team1Roster?.length > 0 && (
                        <div className="bg-card border border-card-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground uppercase mb-6 flex items-center gap-3">
                                {team1?.image_url && (
                                    <Image src={team1.image_url} alt="" width={24} height={24} className="object-contain" />
                                )}
                                Roster {team1?.acronym || team1?.name}
                            </h2>
                            <div className="space-y-3">
                                {match.team1Roster.map((player) => (
                                    <div key={player.id} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                                        <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center overflow-hidden">
                                            {player.image_url ? (
                                                <Image src={player.image_url} alt={player.name} width={40} height={40} className="object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-muted">{player.name?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">{player.name}</p>
                                            <p className="text-xs text-muted">
                                                {player.first_name} {player.last_name}
                                                {player.nationality && ` • ${player.nationality}`}
                                            </p>
                                        </div>
                                        {player.role && (
                                            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded uppercase">
                                                {player.role}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team 2 Roster */}
                    {match.team2Roster?.length > 0 && (
                        <div className="bg-card border border-card-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground uppercase mb-6 flex items-center gap-3">
                                {team2?.image_url && (
                                    <Image src={team2.image_url} alt="" width={24} height={24} className="object-contain" />
                                )}
                                Roster {team2?.acronym || team2?.name}
                            </h2>
                            <div className="space-y-3">
                                {match.team2Roster.map((player) => (
                                    <div key={player.id} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                                        <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center overflow-hidden">
                                            {player.image_url ? (
                                                <Image src={player.image_url} alt={player.name} width={40} height={40} className="object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-muted">{player.name?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">{player.name}</p>
                                            <p className="text-xs text-muted">
                                                {player.first_name} {player.last_name}
                                                {player.nationality && ` • ${player.nationality}`}
                                            </p>
                                        </div>
                                        {player.role && (
                                            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded uppercase">
                                                {player.role}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Player Statistics */}
            {match.playerStats?.length > 0 && (
                <div className="bg-card border border-card-border rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-foreground uppercase mb-6">
                        📈 Statistiques du match
                    </h2>

                    {/* Stats Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-card-border">
                                    <th className="text-left py-3 px-2 text-muted uppercase text-xs font-medium">Joueur</th>
                                    <th className="text-center py-3 px-2 text-muted uppercase text-xs font-medium">K</th>
                                    <th className="text-center py-3 px-2 text-muted uppercase text-xs font-medium">D</th>
                                    <th className="text-center py-3 px-2 text-muted uppercase text-xs font-medium">A</th>
                                    <th className="text-center py-3 px-2 text-muted uppercase text-xs font-medium">K/D</th>
                                    <th className="text-center py-3 px-2 text-muted uppercase text-xs font-medium">ADR</th>
                                    <th className="text-center py-3 px-2 text-muted uppercase text-xs font-medium">HS%</th>
                                    <th className="text-center py-3 px-2 text-muted uppercase text-xs font-medium">Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Team 1 Stats */}
                                <tr className="bg-primary/5">
                                    <td colSpan={8} className="py-2 px-2 font-semibold text-foreground flex items-center gap-2">
                                        {team1?.image_url && (
                                            <Image src={team1.image_url} alt="" width={16} height={16} className="object-contain" />
                                        )}
                                        {team1?.name || "Team 1"}
                                    </td>
                                </tr>
                                {match.playerStats
                                    .filter(p => p.team_id === team1?.id)
                                    .sort((a, b) => b.rating - a.rating)
                                    .map(player => (
                                        <tr key={player.player_id} className="border-b border-card-border/50 hover:bg-background/50">
                                            <td className="py-3 px-2 font-medium text-foreground">{player.name}</td>
                                            <td className="text-center py-3 px-2 text-green-400 font-medium">{player.kills}</td>
                                            <td className="text-center py-3 px-2 text-red-400 font-medium">{player.deaths}</td>
                                            <td className="text-center py-3 px-2 text-yellow-400 font-medium">{player.assists}</td>
                                            <td className={`text-center py-3 px-2 font-bold ${player.kd_ratio >= 1 ? "text-green-400" : "text-red-400"}`}>
                                                {player.kd_ratio.toFixed(2)}
                                            </td>
                                            <td className="text-center py-3 px-2 text-foreground">{player.adr.toFixed(1)}</td>
                                            <td className="text-center py-3 px-2 text-foreground">{player.hs_percentage}%</td>
                                            <td className={`text-center py-3 px-2 font-bold ${player.rating >= 1.2 ? "text-green-400" :
                                                player.rating >= 1.0 ? "text-yellow-400" :
                                                    "text-red-400"
                                                }`}>
                                                {player.rating.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                }

                                {/* Team 2 Stats */}
                                <tr className="bg-primary/5">
                                    <td colSpan={8} className="py-2 px-2 font-semibold text-foreground flex items-center gap-2 mt-4">
                                        {team2?.image_url && (
                                            <Image src={team2.image_url} alt="" width={16} height={16} className="object-contain" />
                                        )}
                                        {team2?.name || "Team 2"}
                                    </td>
                                </tr>
                                {match.playerStats
                                    .filter(p => p.team_id === team2?.id)
                                    .sort((a, b) => b.rating - a.rating)
                                    .map(player => (
                                        <tr key={player.player_id} className="border-b border-card-border/50 hover:bg-background/50">
                                            <td className="py-3 px-2 font-medium text-foreground">{player.name}</td>
                                            <td className="text-center py-3 px-2 text-green-400 font-medium">{player.kills}</td>
                                            <td className="text-center py-3 px-2 text-red-400 font-medium">{player.deaths}</td>
                                            <td className="text-center py-3 px-2 text-yellow-400 font-medium">{player.assists}</td>
                                            <td className={`text-center py-3 px-2 font-bold ${player.kd_ratio >= 1 ? "text-green-400" : "text-red-400"}`}>
                                                {player.kd_ratio.toFixed(2)}
                                            </td>
                                            <td className="text-center py-3 px-2 text-foreground">{player.adr.toFixed(1)}</td>
                                            <td className="text-center py-3 px-2 text-foreground">{player.hs_percentage}%</td>
                                            <td className={`text-center py-3 px-2 font-bold ${player.rating >= 1.2 ? "text-green-400" :
                                                player.rating >= 1.0 ? "text-yellow-400" :
                                                    "text-red-400"
                                                }`}>
                                                {player.rating.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t border-card-border flex flex-wrap gap-4 text-xs text-muted">
                        <span><strong>K</strong> = Kills</span>
                        <span><strong>D</strong> = Deaths</span>
                        <span><strong>A</strong> = Assists</span>
                        <span><strong>K/D</strong> = Kill/Death Ratio</span>
                        <span><strong>ADR</strong> = Average Damage per Round</span>
                        <span><strong>HS%</strong> = Headshot Percentage</span>
                    </div>
                </div>
            )}

            {/* Head to Head */}
            {match.headToHead?.length > 0 && (
                <div className="bg-card border border-card-border rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-foreground uppercase mb-6">
                        ⚔️ Historique des confrontations
                    </h2>
                    <div className="space-y-3">
                        {match.headToHead.map((h2hMatch) => {
                            const h2hScore1 = h2hMatch.results?.find((r: any) => r.team_id === team1?.id)?.score ?? 0;
                            const h2hScore2 = h2hMatch.results?.find((r: any) => r.team_id === team2?.id)?.score ?? 0;
                            const h2hWinner = h2hMatch.winner_id;

                            return (
                                <div key={h2hMatch.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-xs text-muted mb-1">{h2hMatch.league_name} • {h2hMatch.serie_name}</p>
                                        <p className="text-xs text-muted">
                                            {new Date(h2hMatch.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-sm font-medium ${h2hWinner === team1?.id ? "text-green-400" : "text-foreground"}`}>
                                            {team1?.acronym || team1?.name}
                                        </span>
                                        <span className={`text-xl font-bold ${h2hWinner === team1?.id ? "text-green-400" : "text-foreground"}`}>
                                            {h2hScore1}
                                        </span>
                                        <span className="text-muted">-</span>
                                        <span className={`text-xl font-bold ${h2hWinner === team2?.id ? "text-green-400" : "text-foreground"}`}>
                                            {h2hScore2}
                                        </span>
                                        <span className={`text-sm font-medium ${h2hWinner === team2?.id ? "text-green-400" : "text-foreground"}`}>
                                            {team2?.acronym || team2?.name}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-right">
                                        {h2hWinner === team1?.id && <span className="text-xs text-green-400">✓</span>}
                                        {h2hWinner === team2?.id && <span className="text-xs text-green-400 ml-auto">✓</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Form */}
            {(match.team1RecentForm?.length > 0 || match.team2RecentForm?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Team 1 Recent Form */}
                    {match.team1RecentForm?.length > 0 && (
                        <div className="bg-card border border-card-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground uppercase mb-6 flex items-center gap-3">
                                📊 Forme récente - {team1?.acronym || team1?.name}
                            </h2>
                            <div className="flex gap-2 mb-4">
                                {match.team1RecentForm.map((m, i) => (
                                    <div
                                        key={m.id}
                                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${m.won ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                            }`}
                                        title={`vs ${m.opponent_name}: ${m.score}-${m.opponent_score}`}
                                    >
                                        {m.won ? "W" : "L"}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                {match.team1RecentForm.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between p-2 bg-background rounded text-sm">
                                        <span className="text-muted truncate flex-1">vs {m.opponent_name}</span>
                                        <span className={`font-bold ${m.won ? "text-green-400" : "text-red-400"}`}>
                                            {m.score} - {m.opponent_score}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team 2 Recent Form */}
                    {match.team2RecentForm?.length > 0 && (
                        <div className="bg-card border border-card-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground uppercase mb-6 flex items-center gap-3">
                                📊 Forme récente - {team2?.acronym || team2?.name}
                            </h2>
                            <div className="flex gap-2 mb-4">
                                {match.team2RecentForm.map((m, i) => (
                                    <div
                                        key={m.id}
                                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${m.won ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                            }`}
                                        title={`vs ${m.opponent_name}: ${m.score}-${m.opponent_score}`}
                                    >
                                        {m.won ? "W" : "L"}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                {match.team2RecentForm.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between p-2 bg-background rounded text-sm">
                                        <span className="text-muted truncate flex-1">vs {m.opponent_name}</span>
                                        <span className={`font-bold ${m.won ? "text-green-400" : "text-red-400"}`}>
                                            {m.score} - {m.opponent_score}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
