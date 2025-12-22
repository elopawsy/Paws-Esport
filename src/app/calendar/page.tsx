"use client";

import { useEffect, useState, useMemo } from "react";
import { VIDEO_GAMES } from "@/types";
import type { VideoGameSlug } from "@/types";
import { Calendar, AlertCircle, Loader2, Users, Filter } from "lucide-react";
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

interface TrackedTeam {
  id: number;
  teamId: number;
  team: {
    id: number;
    name: string;
    acronym: string | null;
    imageUrl: string | null;
  };
}

interface MatchesResponse {
  live: Match[];
  upcoming: Match[];
  past: Match[];
}

export default function CalendarPage() {
  const [selectedGame, setSelectedGame] = useState<VideoGameSlug>("cs-2");
  const [matches, setMatches] = useState<Match[]>([]);
  const [trackedTeamIds, setTrackedTeamIds] = useState<Set<number>>(new Set());
  const [showOnlyTracked, setShowOnlyTracked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTracked, setLoadingTracked] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tracked teams on mount
  useEffect(() => {
    async function fetchTrackedTeams() {
      setLoadingTracked(true);
      try {
        const res = await fetch("/api/user/tracked-teams");
        if (res.ok) {
          const data: TrackedTeam[] = await res.json();
          setTrackedTeamIds(new Set(data.map(t => t.teamId)));
        }
      } catch (err) {
        console.error("Error fetching tracked teams:", err);
      } finally {
        setLoadingTracked(false);
      }
    }

    fetchTrackedTeams();
  }, []);

  // Fetch matches when game changes
  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/matches?game=${selectedGame}`);
        if (!res.ok) {
          throw new Error("Failed to fetch matches");
        }
        const data: MatchesResponse = await res.json();
        
        // Combine live and upcoming matches for the calendar
        // Filter to only include matches with scheduled dates
        const allMatches = [
          ...(data.live || []), 
          ...(data.upcoming || [])
        ].filter(m => m.scheduled_at || m.begin_at);
        
        setMatches(allMatches);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [selectedGame]);

  // Filter matches by tracked teams if enabled
  const filteredMatches = useMemo(() => {
    if (!showOnlyTracked || trackedTeamIds.size === 0) {
      return matches;
    }

    return matches.filter(match => {
      // Check if any opponent team is in tracked teams
      return match.opponents?.some(opp => 
        opp.opponent?.id && trackedTeamIds.has(opp.opponent.id)
      );
    });
  }, [matches, showOnlyTracked, trackedTeamIds]);

  const hasTrackedTeams = trackedTeamIds.size > 0;

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

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-6 pb-4">
          {/* Game Selector */}
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest whitespace-nowrap">
              Game
            </span>
            <div className="h-8 w-px bg-card-border flex-shrink-0" />
            <div className="flex gap-3">
              {Object.entries(VIDEO_GAMES).map(([slug, game]) => (
                <button
                  key={slug}
                  onClick={() => setSelectedGame(slug as VideoGameSlug)}
                  disabled={loading}
                  className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold uppercase tracking-wide rounded-lg transition-all whitespace-nowrap disabled:opacity-50 ${
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

          {/* Tracked Teams Filter Toggle */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setShowOnlyTracked(!showOnlyTracked)}
              disabled={!hasTrackedTeams || loadingTracked}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                showOnlyTracked && hasTrackedTeams
                  ? "bg-primary text-primary-foreground shadow-md"
                  : hasTrackedTeams
                  ? "bg-secondary/50 border border-card-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  : "bg-secondary/30 border border-card-border/50 text-muted-foreground/50 cursor-not-allowed"
              }`}
              title={hasTrackedTeams ? "Filter by tracked teams" : "Follow some teams to use this filter"}
            >
              <Users className="w-4 h-4" />
              <span>My Teams</span>
              {hasTrackedTeams && (
                <span className={`px-1.5 py-0.5 text-xs rounded ${
                  showOnlyTracked ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
                }`}>
                  {trackedTeamIds.size}
                </span>
              )}
            </button>
            
            {/* Loading indicator */}
            {(loading || loadingTracked) && (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            )}
          </div>
        </div>

        {/* Filter Info */}
        {showOnlyTracked && hasTrackedTeams && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-4 py-2 rounded-lg border border-card-border/50">
            <Filter className="w-4 h-4 text-primary" />
            <span>
              Showing only matches from your <strong>{trackedTeamIds.size}</strong> tracked team{trackedTeamIds.size > 1 ? 's' : ''}
              {filteredMatches.length === 0 && matches.length > 0 && (
                <span className="text-amber-500 ml-2">• No upcoming matches found</span>
              )}
            </span>
          </div>
        )}
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
      {!error && <MatchCalendar matches={filteredMatches} loading={loading} />}
    </div>
  );
}
