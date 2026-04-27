import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { VIDEO_GAMES } from "@/types";
import type { VideoGameSlug } from "@/types";
import { Calendar, Trophy, Coins, ArrowRight, AlertCircle } from "lucide-react";
import { getTournamentDisplayName } from "@/lib/tournament-utils";
import TrackedTeamsMatches from "@/components/home/TrackedTeamsMatches";
import AvailableBetsSection from "@/components/home/AvailableBetsSection";
import GameSelector from "@/components/home/GameSelector";
import { TournamentService } from "@/services";

interface Tournament {
  id: number;
  slug: string;
  name: string;
  tier: string | null;
  begin_at: string | null;
  end_at: string | null;
  prizepool: string | null;
  league: {
    id: number;
    name: string;
    image_url: string | null;
  } | null;
  serie: {
    id: number;
    name: string | null;
    full_name: string | null;
  } | null;
}

interface TournamentsData {
  running: Tournament[];
  upcoming: Tournament[];
  past: Tournament[];
}

const TIER_COLORS: Record<string, string> = {
  s: "from-yellow-500/20 to-amber-600/20 text-yellow-500 border-yellow-500/50",
  a: "from-purple-500/20 to-indigo-600/20 text-purple-400 border-purple-500/50",
  b: "from-blue-500/20 to-cyan-600/20 text-blue-400 border-blue-500/50",
  c: "from-green-500/20 to-emerald-600/20 text-green-400 border-green-500/50",
  d: "from-gray-500/20 to-slate-600/20 text-gray-400 border-gray-500/50",
};

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const tierClass = tournament.tier
    ? TIER_COLORS[tournament.tier.toLowerCase()] || "text-muted border-border-subtle"
    : "text-muted border-border-subtle";

  const tournamentUrl = tournament.slug ? `/tournaments/${tournament.slug}` : `/tournaments/${tournament.id}`;

  return (
    <Link
      href={tournamentUrl}
      className="block group relative bg-surface h-full overflow-hidden border border-border-subtle hover:border-border-strong hover:bg-surface-2 transition-colors"
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-10 h-10 flex-shrink-0 bg-surface-2 p-1.5 border border-border-subtle">
            {tournament.league?.image_url ? (
              <Image
                src={tournament.league.image_url}
                alt={tournament.league.name}
                fill
                sizes="40px"
                className="object-contain p-0.5"
              />
            ) : (
              <Trophy className="w-full h-full text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold font-display text-sm leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3 uppercase tracking-[0.02em]">
              {getTournamentDisplayName(tournament)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {tournament.tier && (
            <span className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${tierClass}`}>
              {tournament.tier}-Tier
            </span>
          )}
          {tournament.prizepool && (
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-primary border border-primary/40 font-semibold tabular">
              <Coins className="w-3 h-3" />
              {tournament.prizepool}
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-border-subtle flex items-center text-[11px] text-muted font-medium tabular uppercase tracking-wider">
          <Calendar className="w-3 h-3 mr-1.5 text-primary" />
          {tournament.begin_at && (
            <span>
              {new Date(tournament.begin_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
          {tournament.begin_at && tournament.end_at && <span className="mx-1.5 text-border-strong">·</span>}
          {tournament.end_at && (
            <span>
              {new Date(tournament.end_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function TournamentSection({
  title,
  tournaments,
  icon: Icon,
}: {
  title: string;
  tournaments: Tournament[];
  icon: React.ElementType;
}) {
  if (tournaments.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-subtle">
        <span className="inline-block w-[3px] h-4 bg-primary" aria-hidden="true" />
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-display font-semibold uppercase tracking-[0.12em] text-foreground">
          {title}
        </h3>
        <span className="ml-auto text-[11px] tabular text-muted uppercase tracking-wider">
          {tournaments.length} total
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {tournaments.slice(0, 8).map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>
    </div>
  );
}

function TournamentsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-[180px] bg-surface border border-border-subtle animate-pulse"
        />
      ))}
    </div>
  );
}

interface TournamentsContentProps {
  tournaments: TournamentsData;
  gameName: string;
}

function TournamentsContent({ tournaments, gameName }: TournamentsContentProps) {
  const { running, upcoming, past } = tournaments;
  const hasNoTournaments = running.length === 0 && upcoming.length === 0 && past.length === 0;

  return (
    <>
      <TournamentSection title="Live Now" tournaments={running} icon={Coins} />
      <TournamentSection title="Upcoming" tournaments={upcoming} icon={Calendar} />
      <TournamentSection title="Recently Finished" tournaments={past} icon={Trophy} />

      {hasNoTournaments && (
        <div className="py-24 text-center border border-dashed border-border-subtle">
          <p className="text-muted text-xs uppercase tracking-[0.2em]">
            No tournaments found for {gameName}
          </p>
        </div>
      )}
    </>
  );
}

interface HomePageProps {
  searchParams: Promise<{ game?: string }>;
}

/**
 * Homepage - Server Component
 * Fetches tournaments server-side for better caching and SEO
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedGame = (params.game as VideoGameSlug) || "cs-2";
  
  let tournaments: TournamentsData = { running: [], upcoming: [], past: [] };
  let error: string | null = null;

  try {
    tournaments = await TournamentService.getAllTournaments(selectedGame);
  } catch (e) {
    console.error("Error fetching tournaments:", e);
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div className="container-custom py-8">
      {/* Hero — Esports Charts–style: dense, minimal, no glow */}
      <section className="mb-10 border border-border-subtle bg-surface">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 p-6 md:p-10 border-b md:border-b-0 md:border-r border-border-subtle">
            <div className="inline-flex items-center gap-2 mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="status-dot-live" aria-hidden="true" />
              Live Updates
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 leading-[0.95] text-foreground tracking-[0.02em]">
              <span className="text-primary">Professional</span> Esports Data
            </h1>

            <p className="text-sm md:text-base text-muted max-w-xl mb-6 leading-relaxed">
              Live tournaments, transfer markets, and match results across CS2, Valorant, LoL and more.
            </p>

            <div className="flex gap-2 flex-wrap">
              <Link
                href="/simulator"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-[12px] uppercase tracking-[0.12em] hover:bg-primary-hover transition-colors group"
              >
                Transfer Simulator
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/tournaments"
                className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-border-strong text-foreground font-semibold text-[12px] uppercase tracking-[0.12em] hover:border-primary hover:text-primary transition-colors"
              >
                All Tournaments
              </Link>
            </div>
          </div>

          <div className="p-6 md:p-10 flex flex-col justify-center gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Live Tournaments</p>
              <p className="text-3xl font-display font-semibold text-foreground tabular">{tournaments.running.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Upcoming</p>
              <p className="text-3xl font-display font-semibold text-foreground tabular">{tournaments.upcoming.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Recently Finished</p>
              <p className="text-3xl font-display font-semibold text-foreground tabular">{tournaments.past.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Selector */}
      <Suspense fallback={<div className="h-12 animate-pulse bg-surface border border-border-subtle mb-8" />}>
        <GameSelector currentGame={selectedGame} />
      </Suspense>

      {/* Tracked Teams Matches Section */}
      <TrackedTeamsMatches />

      {/* Available Bets Section */}
      <AvailableBetsSection />

      {/* Tournaments Section */}
      <section>
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-border-subtle">
          <h2 className="text-lg font-display font-semibold uppercase tracking-[0.08em] text-foreground inline-flex items-center gap-2">
            <span className="inline-block w-[3px] h-5 bg-primary" aria-hidden="true" />
            {VIDEO_GAMES[selectedGame]?.name} Tournaments
          </h2>
        </div>

        {/* Error State */}
        {error && (
          <div className="py-16 text-center border border-destructive/30 bg-destructive/5">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
            <p className="text-destructive font-mono text-xs uppercase mb-2">
              Error: {error}
            </p>
            <p className="text-muted text-xs">
              Please check your API key configuration.
            </p>
          </div>
        )}

        {/* Tournaments Content */}
        {!error && (
          <TournamentsContent
            tournaments={tournaments}
            gameName={VIDEO_GAMES[selectedGame]?.name || "this game"}
          />
        )}
      </section>
    </div>
  );
}