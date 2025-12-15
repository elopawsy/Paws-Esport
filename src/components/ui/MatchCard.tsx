"use client";

import { memo } from "react";
import Link from "next/link";
import CountryFlag from "./CountryFlag";

interface Opponent {
    opponent: {
        id: number;
        name: string;
        acronym?: string;
        image_url: string | null;
        location?: string;
    };
}

interface Result {
    team_id: number;
    score: number;
}

interface Match {
    id: number;
    name: string;
    status: "not_started" | "running" | "finished";
    scheduled_at: string;
    begin_at?: string;
    end_at?: string;
    opponents: Opponent[];
    results: Result[];
    league?: { id: number; name: string; image_url: string | null };
    serie?: { full_name: string };
    tier: string;
}

interface Props {
    match: Match;
    compact?: boolean;
}

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);

    if (diffMins > 0 && diffMins < 60) return `in ${diffMins}m`;
    if (diffHours > 0 && diffHours < 24) return `in ${diffHours}h`;
    if (diffMins < 0 && diffMins > -60) return `${Math.abs(diffMins)}m ago`;
    if (diffHours < 0 && diffHours > -24) return `${Math.abs(diffHours)}h ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TeamDisplay = memo(function TeamDisplay({
    opponent,
    score,
    isWinner,
    compact
}: {
    opponent: Opponent["opponent"];
    score?: number;
    isWinner?: boolean;
    compact?: boolean;
}) {
    return (
        <div className={`flex items-center gap-2 ${compact ? "" : "flex-1"}`}>
            <div className={`${compact ? "w-6 h-6" : "w-8 h-8"} flex items-center justify-center flex-shrink-0`}>
                {opponent.image_url ? (
                    <img src={opponent.image_url} alt="" className="w-full h-full object-contain" />
                ) : (
                    <span className={`${compact ? "text-[10px]" : "text-xs"} font-bold text-muted`}>
                        {opponent.acronym || opponent.name.charAt(0)}
                    </span>
                )}
            </div>
            <span className={`${compact ? "text-xs" : "text-sm"} font-medium truncate ${isWinner ? "text-foreground" : "text-muted"}`}>
                {opponent.acronym || opponent.name}
            </span>
            {score !== undefined && (
                <span className={`ml-auto ${compact ? "text-sm" : "text-lg"} font-bold ${isWinner ? "text-primary" : "text-muted"}`}>
                    {score}
                </span>
            )}
        </div>
    );
});

const MatchCard = memo(function MatchCard({ match, compact = false }: Props) {
    const team1 = match.opponents[0]?.opponent;
    const team2 = match.opponents[1]?.opponent;
    const score1 = match.results.find(r => r.team_id === team1?.id)?.score;
    const score2 = match.results.find(r => r.team_id === team2?.id)?.score;

    const isFinished = match.status === "finished";
    const isLive = match.status === "running";

    const winner1 = isFinished && score1 !== undefined && score2 !== undefined && score1 > score2;
    const winner2 = isFinished && score1 !== undefined && score2 !== undefined && score2 > score1;

    const statusColor = isLive
        ? "bg-red-500 animate-pulse"
        : isFinished
            ? "bg-muted"
            : "bg-primary";

    return (
        <Link href={`/match/${match.id}`} className={`block bg-card border border-card-border rounded-md overflow-hidden hover:border-primary/30 transition-colors group ${compact ? "p-3" : "p-4"}`}>
            {/* Header */}
            <div className={`flex items-center justify-between ${compact ? "mb-2" : "mb-3"}`}>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                    <span className={`${compact ? "text-[10px]" : "text-xs"} text-muted uppercase tracking-wider font-medium`}>
                        {isLive ? "LIVE" : isFinished ? "Finished" : formatTime(match.scheduled_at)}
                    </span>
                </div>
                <span className={`${compact ? "text-[8px]" : "text-[10px]"} px-1.5 py-0.5 rounded ${match.tier === "Tier 1"
                    ? "bg-primary/20 text-primary"
                    : match.tier === "Tier 2"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-white/10 text-muted"
                    } uppercase tracking-wider font-bold`}>
                    {match.tier}
                </span>
            </div>

            {/* Teams */}
            <div className={`space-y-2 ${compact ? "" : "mb-3"}`}>
                {team1 && (
                    <TeamDisplay
                        opponent={team1}
                        score={score1}
                        isWinner={winner1}
                        compact={compact}
                    />
                )}
                {team2 && (
                    <TeamDisplay
                        opponent={team2}
                        score={score2}
                        isWinner={winner2}
                        compact={compact}
                    />
                )}
                {(!team1 || !team2) && (
                    <p className="text-xs text-muted italic">TBD</p>
                )}
            </div>

            {/* Footer */}
            {!compact && match.league && (
                <div className="pt-2 border-t border-card-border">
                    <p className="text-[10px] text-muted truncate uppercase tracking-wide">
                        {match.league.name}
                        {match.serie?.full_name && ` • ${match.serie.full_name}`}
                    </p>
                </div>
            )}
        </Link>
    );
});

export default MatchCard;
