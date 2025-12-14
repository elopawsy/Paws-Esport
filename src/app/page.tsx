"use client";

import { useEffect, useState } from "react";
import TeamCard from "@/components/ui/TeamCard";
import { TeamRanking } from "@/lib/types";
import Link from "next/link";

export default function HomePage() {
  const [teams, setTeams] = useState<TeamRanking[]>([]);
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
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          CS2 Transfer
          <span className="bg-gradient-to-r from-hltv-orange to-orange-400 bg-clip-text text-transparent">
            {" "}
            Simulator
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Simule tes transferts de rêve entre les meilleures équipes CS2 du monde.
          Sélectionne des équipes et déplace les joueurs pour créer ta super-équipe !
        </p>
        <Link
          href="/simulator"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-hltv-orange to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-hltv-orange/30 hover:shadow-hltv-orange/50 hover:scale-105 transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          Lancer le Simulateur
        </Link>
      </section>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-8 bg-hltv-orange rounded-full" />
          Top 30 Mondial
        </h2>
        <p className="text-gray-500 text-sm">Données HLTV</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 animate-pulse"
            >
              <div className="w-8 h-8 bg-navy-700 rounded-lg mb-4" />
              <div className="w-20 h-20 bg-navy-700 rounded-lg mx-auto mb-4" />
              <div className="h-5 bg-navy-700 rounded mb-2" />
              <div className="h-4 bg-navy-700 rounded w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Teams Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
