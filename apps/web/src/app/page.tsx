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
    ? TIER_COLORS[tournament.tier.toLowerCase()] || "from-gray-700/20 to-gray-800/20 text-gray-400 border-gray-700"
    : "from-gray-700/20 to-gray-800/20 text-gray-400 border-gray-700";

  const tournamentUrl = tournament.slug ? `/tournaments/${tournament.slug}` : `/tournaments/${tournament.id}`;

  return (
    <Link
      href={tournamentUrl}
      className="block group relative bg-card h-full rounded-xl overflow-hidden border border-card-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 pointer-events-none" />

      <div className="p-5 flex flex-col h-full relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-12 h-12 flex-shrink-0 bg-secondary/50 rounded-lg p-2 border border-card-border group-hover:border-primary/30 transition-colors">
            {tournament.league?.image_url ? (
              <Image
                src={tournament.league.image_url}
                alt={tournament.league.name}
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            ) : (
              <Trophy className="w-full h-full text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold font-display text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-3">
              {getTournamentDisplayName(tournament)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          {tournament.tier && (
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border bg-gradient-to-r ${tierClass}`}>
              {tournament.tier}-Tier
            </span>
          )}
          {tournament.prizepool && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 rounded font-medium">
              <Coins className="w-3 h-3" />
              {tournament.prizepool}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-card-border flex items-center text-xs text-muted-foreground font-medium">
          <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
          {tournament.begin_at && (
            <span>
              {new Date(tournament.begin_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
          {tournament.begin_at && tournament.end_at && <span className="mx-1">→</span>}
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
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-display font-bold uppercase tracking-wide text-foreground">
          {title}
        </h3>
        <span className="ml-auto px-3 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-full border border-card-border">
          {tournaments.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tournaments.slice(0, 8).map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>
    </div>
  );
}

function TournamentsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-[280px] bg-card border border-card-border animate-pulse rounded-xl"
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
        <div className="py-32 text-center border border-dashed border-card-border rounded-xl">
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
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
    <div className="container-custom py-12">
      {/* Hero Section */}
      <section className="mb-16 relative overflow-hidden rounded-3xl bg-secondary/30 border border-card-border p-8 md:p-16">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live Updates
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight text-foreground leading-[0.9]">
            PROFESSIONAL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">ESPORTS HUB</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 font-light leading-relaxed">
            Track live tournaments, transfer news, and match results for CS2, Valorant, LoL, and more in real-time.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link
              href="/simulator"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest hover:bg-primary-hover transition-all rounded-lg shadow-lg shadow-primary/20 group"
            >
              Transfer Simulator
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/tournaments"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-card border border-card-border text-foreground font-bold text-sm uppercase tracking-widest hover:border-primary/50 transition-all rounded-lg"
            >
              All Tournaments
            </Link>
          </div>
        </div>
      </section>

      {/* Game Selector - Client Component */}
      <Suspense fallback={<div className="h-16 animate-pulse bg-secondary/30 rounded-lg mb-12" />}>
        <GameSelector currentGame={selectedGame} />
      </Suspense>

      {/* Tracked Teams Matches Section */}
      <TrackedTeamsMatches />

      {/* Available Bets Section */}
      <AvailableBetsSection />

      {/* Tournaments Section */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-card-border pb-6">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-foreground">
            {VIDEO_GAMES[selectedGame]?.name} Tournaments
          </h2>
        </div>

        {/* Error State */}
        {error && (
          <div className="py-20 text-center bg-destructive/5 rounded-xl border border-destructive/20">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-mono text-sm uppercase mb-4">
              Error: {error}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
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