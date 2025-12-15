"use client";

import { useEffect, useState, useMemo } from "react";
import MatchCard from "@/components/ui/MatchCard";
import Link from "next/link";

interface Match {
  id: number;
  name: string;
  status: "not_started" | "running" | "finished";
  scheduled_at: string;
  begin_at?: string;
  end_at?: string;
  opponents: any[];
  results: any[];
  league?: { id: number; name: string; image_url: string | null };
  serie?: { full_name: string };
  tier: string;
}

interface MatchData {
  live: Match[];
  upcoming: Match[];
  past: Match[];
}

export default function HomePage() {
  const [matches, setMatches] = useState<MatchData>({ live: [], upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "tier1" | "tier2">("all");

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchMatches() {
      try {
        const res = await fetch("/api/matches");
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "System Malfunction");
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();

    // Poll every 30 seconds to update scores
    intervalId = setInterval(fetchMatches, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Filter matches by tier
  const filteredMatches = useMemo(() => {
    if (activeTab === "all") return matches;
    const tierFilter = activeTab === "tier1" ? "Tier 1" : "Tier 2";
    return {
      live: matches.live.filter(m => m.tier === tierFilter),
      upcoming: matches.upcoming.filter(m => m.tier === tierFilter),
      past: matches.past.filter(m => m.tier === tierFilter),
    };
  }, [matches, activeTab]);

  const hasLive = filteredMatches.live.length > 0;
  const hasUpcoming = filteredMatches.upcoming.length > 0;
  const hasPast = filteredMatches.past.length > 0;

  return (
    <div className="container-custom py-16">
      {/* Hero Section */}
      <section className="mb-20">
        <h1 className="text-7xl font-display font-bold mb-6 tracking-tight uppercase text-foreground">
          Transfer <span className="text-primary">Market</span>
        </h1>

        <p className="text-xl text-muted max-w-xl mb-10 font-light">
          Manage rosters. Simulate trades. Build the ultimate lineup.
        </p>

        <Link
          href="/simulator"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-medium text-sm uppercase tracking-widest hover:bg-blue-600 transition-colors rounded-sm shadow-lg shadow-blue-500/20"
        >
          Start Simulation
          <span className="text-lg">→</span>
        </Link>
      </section>

      {/* Matches Section */}
      <section>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 border-b border-card-border pb-4">
          <h2 className="text-2xl font-display font-semibold uppercase tracking-wide text-foreground">
            CS2 Matches
          </h2>
          <div className="flex items-center gap-2">
            {matches.live.length > 0 && (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono text-red-400 uppercase tracking-wider">
                  {matches.live.length} Live
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors ${activeTab === "all"
              ? "bg-primary text-white"
              : "bg-card border border-card-border text-muted hover:text-foreground hover:border-muted"
              }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setActiveTab("tier1")}
            className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors ${activeTab === "tier1"
              ? "bg-primary text-white"
              : "bg-card border border-card-border text-muted hover:text-foreground hover:border-muted"
              }`}
          >
            🏆 Tier 1
          </button>
          <button
            onClick={() => setActiveTab("tier2")}
            className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors ${activeTab === "tier2"
              ? "bg-primary text-white"
              : "bg-card border border-card-border text-muted hover:text-foreground hover:border-muted"
              }`}
          >
            🥈 Tier 2
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[150px] bg-card border border-card-border animate-pulse rounded-md"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-20 text-center bg-red-500/5 rounded border border-red-500/20">
            <p className="text-red-400 font-mono text-sm uppercase mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-400 underline decoration-1 underline-offset-4 hover:text-white"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <div className="space-y-12">
            {/* Live Matches */}
            {hasLive && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <h3 className="text-lg font-display font-semibold uppercase tracking-wide text-foreground">
                    Live Now
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMatches.live.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Matches */}
            {hasUpcoming && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg">📅</span>
                  <h3 className="text-lg font-display font-semibold uppercase tracking-wide text-foreground">
                    Upcoming
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMatches.upcoming.slice(0, 8).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Matches */}
            {hasPast && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg">📜</span>
                  <h3 className="text-lg font-display font-semibold uppercase tracking-wide text-foreground">
                    Recent Results
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMatches.past.slice(0, 8).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!hasLive && !hasUpcoming && !hasPast && (
              <div className="py-20 text-center">
                <p className="text-muted text-sm uppercase tracking-widest">
                  No matches found for this filter
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}