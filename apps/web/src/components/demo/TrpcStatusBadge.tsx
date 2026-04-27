"use client";

import { trpc } from "@/lib/trpc";

/**
 * Tiny badge that exercises the tRPC pipeline end-to-end.
 * Renders the procedure's reply when the call succeeds — purely a
 * smoke test for the wiring, not a real product feature.
 */
export default function TrpcStatusBadge() {
    const { data, isLoading, isError } = trpc.stats.global.useQuery();

    if (isLoading) {
        return (
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted" aria-hidden="true" />
                tRPC: connecting…
            </span>
        );
    }

    if (isError || !data) {
        return (
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-destructive">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" aria-hidden="true" />
                tRPC: error
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-primary tabular">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
            tRPC ok · uptime {Math.round(data.uptime)}s
        </span>
    );
}
