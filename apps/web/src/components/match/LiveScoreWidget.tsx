"use client";

import { useQuery } from "convex/react";
import { api } from "@paws/convex";

interface LiveScoreWidgetProps {
    matchId: number;
}

/**
 * Live score widget backed by Convex. Subscribes to liveMatches.get
 * and re-renders whenever the NestJS API pushes a new score via
 * liveMatches.upsert — no polling needed.
 *
 * Renders nothing when the match has not been pushed yet, so it is
 * safe to drop in next to a list of matches.
 */
export default function LiveScoreWidget({ matchId }: LiveScoreWidgetProps) {
    const live = useQuery(api.liveMatches.get, { matchId });

    if (live === undefined) {
        return (
            <div className="border border-border-subtle bg-surface p-3 text-xs uppercase tracking-wider text-muted">
                Connecting…
            </div>
        );
    }

    if (live === null) {
        return (
            <div className="border border-border-subtle bg-surface p-3 text-xs uppercase tracking-wider text-muted">
                No live data for match #{matchId}
            </div>
        );
    }

    return (
        <div className="border border-border-subtle bg-surface p-3">
            <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted">
                    <span className="status-dot-live" aria-hidden="true" />
                    Live · realtime
                </span>
                <span className="text-[10px] tabular text-muted">
                    {new Date(live.updatedAt).toLocaleTimeString()}
                </span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <span className="text-sm font-medium text-foreground truncate">
                    {live.teamA.acronym ?? live.teamA.name}
                </span>
                <span className="font-display text-2xl tabular text-primary">
                    {live.teamA.score} <span className="text-muted">·</span> {live.teamB.score}
                </span>
                <span className="text-sm font-medium text-foreground truncate text-right">
                    {live.teamB.acronym ?? live.teamB.name}
                </span>
            </div>
        </div>
    );
}
