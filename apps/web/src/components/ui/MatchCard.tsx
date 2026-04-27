"use client";

import { memo } from "react";
import Link from "next/link";

import type { Match, MatchOpponent } from "@/types";

interface Props {
    match: Match;
    compact?: boolean;
}

function formatTime(dateString: string | null): string {
    if (!dateString) return "-";
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
    compact,
}: {
    opponent: MatchOpponent["opponent"];
    score?: number;
    isWinner?: boolean;
    compact?: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            <div className={`${compact ? "w-5 h-5" : "w-7 h-7"} flex items-center justify-center flex-shrink-0`}>
                {opponent.image_url ? (
                    <img src={opponent.image_url} alt={`${opponent.name} logo`} className="w-full h-full object-contain" />
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
                <span className={`ml-auto tabular ${compact ? "text-sm" : "text-base"} font-semibold ${isWinner ? "text-primary" : "text-muted"}`}>
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
    const isCanceled = match.status === "canceled";

    const winner1 = isFinished && score1 !== undefined && score2 !== undefined && score1 > score2;
    const winner2 = isFinished && score1 !== undefined && score2 !== undefined && score2 > score1;

    const matchUrl = match.slug ? `/match/${match.slug}` : `/match/${match.id}`;
    const matchLabel = `${team1?.name || "TBD"} versus ${team2?.name || "TBD"}${isLive ? ", currently live" : isFinished ? `, final score ${score1} to ${score2}` : ""}, ${match.league?.name || ""}`;

    return (
        <Link
            href={matchUrl}
            className={`block bg-surface border border-border-subtle hover:border-border-strong hover:bg-surface-2 transition-colors group ${compact ? "p-2.5" : "p-3.5"}`}
            aria-label={matchLabel}
        >
            {/* Header */}
            <div className={`flex items-center justify-between ${compact ? "mb-2" : "mb-2.5"}`}>
                <div className="flex items-center gap-1.5">
                    {isLive ? (
                        <span className="status-dot-live" aria-hidden="true" />
                    ) : (
                        <span
                            className={`inline-block w-1.5 h-1.5 rounded-full ${isFinished ? "bg-muted-foreground" : isCanceled ? "bg-destructive/60" : "bg-primary"}`}
                            aria-hidden="true"
                        />
                    )}
                    <span className={`${compact ? "text-[10px]" : "text-[11px]"} text-muted uppercase tracking-[0.1em] font-medium`}>
                        {isLive ? "Live" : isFinished ? "Final" : isCanceled ? "Canceled" : formatTime(match.scheduled_at)}
                    </span>
                    <span className="sr-only">
                        Match status: {isLive ? "Currently live" : isFinished ? "Match finished" : isCanceled ? "Match canceled" : `Scheduled for ${match.scheduled_at}`}
                    </span>
                </div>
                {match.tier && (
                    <span className={`${compact ? "text-[9px]" : "text-[10px]"} px-1.5 py-0.5 uppercase tracking-wider font-semibold ${match.tier === "Tier 1"
                        ? "text-primary border border-primary/40"
                        : match.tier === "Tier 2"
                            ? "text-warning border border-warning/40"
                            : "text-muted border border-border-subtle"
                        }`}>
                        {match.tier}
                    </span>
                )}
            </div>

            {/* Teams */}
            <div className="space-y-1.5">
                {team1 && (
                    <TeamDisplay opponent={team1} score={score1} isWinner={winner1} compact={compact} />
                )}
                {team2 && (
                    <TeamDisplay opponent={team2} score={score2} isWinner={winner2} compact={compact} />
                )}
                {(!team1 || !team2) && (
                    <p className="text-xs text-muted italic">TBD</p>
                )}
            </div>

            {/* Footer */}
            {!compact && match.league && (
                <div className="mt-3 pt-2 border-t border-border-subtle">
                    <p className="text-[10px] text-muted truncate uppercase tracking-wider">
                        {match.league.name}
                        {match.serie?.full_name && ` · ${match.serie.full_name}`}
                    </p>
                </div>
            )}
        </Link>
    );
});

export default MatchCard;
