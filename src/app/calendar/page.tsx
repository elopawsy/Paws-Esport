"use client";

import { useEffect, useState } from "react";
import { VIDEO_GAMES } from "@/types";
import type { VideoGameSlug } from "@/types";
import { Calendar, AlertCircle } from "lucide-react";
import MatchCalendar from "@/components/calendar/MatchCalendar";

interface Match {
  id: number;
  name: string;
  status: string;
  begin_at: string | null;
  scheduled_at: string | null;
  tournament: {
    id: number;
    name: string;
  } | null;
  league: {
    id: number;
    name: string;
    image_url: string | null;
  } | null;
  opponents: {
    type: string;
    opponent: {
      id: number;
      name: string;
      acronym: string | null;
      image_url: string | null;
    };
  }[];
}

interface MatchesResponse {
  live: Match[];
  upcoming: Match[];
  past: Match[];
}

export default function CalendarPage() {
  const [selectedGame, setSelectedGame] = useState<VideoGameSlug>("cs-2");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      setError(null);

      try {
        // Load from local matches.json file
        const res = await fetch("/matches.json");
        if (!res.ok) {
          throw new Error("Failed to fetch matches");
        }
        const data: MatchesResponse = await res.json();
        // Combine live and upcoming matches for the calendar
        const allMatches = [...(data.live || []), ...(data.upcoming || [])];
        setMatches(allMatches);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-foreground">
              Match Calendar
            </h1>
            <p className="text-muted-foreground">
              All upcoming matches organized by date
            </p>
          </div>
        </div>

        {/* Game Selector */}
        <div className="flex items-center gap-6 overflow-x-auto pb-4">
          <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Game
          </span>
          <div className="h-8 w-px bg-card-border flex-shrink-0" />
          <div className="flex gap-3">
            {Object.entries(VIDEO_GAMES).map(([slug, game]) => (
              <button
                key={slug}
                onClick={() => setSelectedGame(slug as VideoGameSlug)}
                className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold uppercase tracking-wide rounded-lg transition-all whitespace-nowrap ${
                  selectedGame === slug
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-secondary/50 border border-card-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                <img
                  src={game.logo}
                  alt={game.name}
                  width={20}
                  height={20}
                  className="object-contain w-5 h-5"
                  style={{ filter: "var(--logo-filter)" }}
                />
                {game.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className="py-20 text-center bg-destructive/5 rounded-xl border border-destructive/20 mb-8">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-mono text-sm uppercase mb-4">
            Error: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-secondary text-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Calendar */}
      {!error && <MatchCalendar matches={matches} loading={loading} />}
    </div>
  );
}
