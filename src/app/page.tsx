"use client";

import { useEffect, useState } from "react";
import TeamCard from "@/components/ui/TeamCard";
import { Team } from "@/lib/types";
import Link from "next/link";

export default function HomePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/teams");
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();
        setTeams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "System Malfunction");
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

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

      {/* Section Title */}
      <div className="flex items-center justify-between mb-10 border-b border-card-border pb-4">
        <h2 className="text-2xl font-display font-semibold uppercase tracking-wide text-foreground">
          World Ranking
        </h2>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           <span className="text-xs font-mono text-muted uppercase tracking-wider">Live Data</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-[250px] bg-card border border-card-border animate-pulse rounded-md"
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

      {/* Teams Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}