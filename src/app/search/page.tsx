"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import MatchCard from "@/components/ui/MatchCard";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, Trophy, Calendar, Coins, Users, Gamepad2, User, ArrowRight } from "lucide-react";
import CountryFlag from "@/components/ui/CountryFlag";

interface SearchResults {
    matches: any[];
    tournaments: any[];
    teams: any[];
    players: any[];
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");
    const [results, setResults] = useState<SearchResults>({ matches: [], tournaments: [], teams: [], players: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query) return;

        async function fetchResults() {
            setLoading(true);
            setError(null);
            try {
                // Fetch all results in parallel
                const [searchRes, teamsRes, playersRes] = await Promise.all([
                    fetch(`/api/search?q=${encodeURIComponent(query!)}`),
                    fetch(`/api/teams/search?q=${encodeURIComponent(query!)}`),
                    fetch(`/api/players/search?q=${encodeURIComponent(query!)}`)
                ]);

                const searchData = searchRes.ok ? await searchRes.json() : { matches: [], tournaments: [] };
                const teamsData = teamsRes.ok ? await teamsRes.json() : [];
                const playersData = playersRes.ok ? await playersRes.json() : [];

                setResults({
                    matches: searchData.matches || [],
                    tournaments: searchData.tournaments || [],
                    teams: teamsData || [],
                    players: playersData || [],
                });
            } catch (err) {
                setError("Impossible de récupérer les résultats");
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [query]);

    const totalResults = results.matches.length + results.tournaments.length + results.teams.length + results.players.length;

    if (!query) {
        return (
            <div className="container-custom py-16 text-center">
                <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                <h1 className="text-2xl text-foreground font-display uppercase tracking-wide mb-2">Search</h1>
                <p className="text-muted-foreground">Enter a search term to find teams, players, tournaments, and matches</p>
            </div>
        );
    }

    return (
        <div className="container-custom py-12">
            <div className="mb-12">
                <h1 className="text-3xl font-display font-bold uppercase mb-2 flex items-center gap-3">
                    <Search className="w-8 h-8 text-primary" />
                    Results for "<span className="text-primary">{query}</span>"
                </h1>
                {!loading && (
                    <p className="text-muted-foreground">{totalResults} results found</p>
                )}
            </div>

            {loading ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                    <div className="animate-spin text-primary mb-4 p-2 bg-primary/10 rounded-full">
                        <Loader2 className="w-8 h-8" />
                    </div>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Searching...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-500 font-bold bg-red-500/5 rounded-lg border border-red-500/20">{error}</div>
            ) : totalResults === 0 ? (
                <div className="text-center py-20 border border-dashed border-card-border rounded-xl bg-secondary/20">
                    <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground font-medium mb-2">No results found for "{query}"</p>
                    <p className="text-sm text-muted-foreground/70">Try searching for a team name, player, or tournament</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {/* Teams Section */}
                    {results.teams.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-3 text-foreground border-b border-card-border pb-4">
                                <Users className="w-5 h-5 text-primary" />
                                Teams
                                <span className="text-xs bg-secondary text-primary px-2.5 py-1 rounded-full font-bold ml-auto border border-card-border">
                                    {results.teams.length}
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {results.teams.map((team) => (
                                    <Link
                                        key={team.id}
                                        href={`/teams/${team.id}`}
                                        className="group flex items-center gap-4 p-4 bg-card border border-card-border rounded-xl hover:border-primary/50 transition-all"
                                    >
                                        <div className="w-14 h-14 rounded-lg bg-secondary border border-card-border overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {team.image_url ? (
                                                <Image
                                                    src={team.image_url}
                                                    alt={team.name}
                                                    width={56}
                                                    height={56}
                                                    className="object-contain p-2"
                                                />
                                            ) : (
                                                <Users className="w-6 h-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                                {team.name}
                                            </p>
                                            {team.location && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <CountryFlag code={team.location} size="sm" />
                                                    {team.location.toUpperCase()}
                                                </p>
                                            )}
                                            {team.current_videogame && (
                                                <p className="text-xs text-muted-foreground/70">{team.current_videogame.name}</p>
                                            )}
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Players Section */}
                    {results.players.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-3 text-foreground border-b border-card-border pb-4">
                                <User className="w-5 h-5 text-primary" />
                                Players
                                <span className="text-xs bg-secondary text-primary px-2.5 py-1 rounded-full font-bold ml-auto border border-card-border">
                                    {results.players.length}
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {results.players.map((player) => (
                                    <Link
                                        key={player.id}
                                        href={`/players/${player.id}`}
                                        className="group flex items-center gap-4 p-4 bg-card border border-card-border rounded-xl hover:border-primary/50 transition-all"
                                    >
                                        <div className="w-14 h-14 rounded-lg bg-secondary border border-card-border overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {player.image_url ? (
                                                <Image
                                                    src={player.image_url}
                                                    alt={player.name}
                                                    width={56}
                                                    height={56}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                                {player.name}
                                            </p>
                                            {player.current_team && (
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {player.current_team.name}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                                                {player.nationality && (
                                                    <CountryFlag code={player.nationality} size="sm" />
                                                )}
                                                {player.role && <span>{player.role}</span>}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Tournaments Section */}
                    {results.tournaments.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-3 text-foreground border-b border-card-border pb-4">
                                <Trophy className="w-5 h-5 text-primary" />
                                Tournaments
                                <span className="text-xs bg-secondary text-primary px-2.5 py-1 rounded-full font-bold ml-auto border border-card-border">
                                    {results.tournaments.length}
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.tournaments.map((tournament) => (
                                    <Link key={tournament.id} href={tournament.slug ? `/tournaments/${tournament.slug}` : `/tournaments/${tournament.id}`} className="group block h-full">
                                        <div className="bg-card border border-card-border p-6 rounded-xl hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider bg-secondary px-2 py-1 rounded border border-card-border group-hover:border-primary/20 transition-colors">
                                                    {tournament.league?.name || tournament.videogame?.name || "Tournament"}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-display font-bold text-foreground mb-6 group-hover:text-primary transition-colors leading-tight">
                                                {tournament.name}
                                            </h3>

                                            <div className="mt-auto space-y-3">
                                                {tournament.begin_at && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="w-4 h-4 text-primary/70" />
                                                        <span className="font-medium">
                                                            {new Date(tournament.begin_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                            {tournament.end_at && ` - ${new Date(tournament.end_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                                                        </span>
                                                    </div>
                                                )}

                                                {tournament.prizepool && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Coins className="w-4 h-4 text-yellow-500/70" />
                                                        <span className="font-medium">{tournament.prizepool}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Matches Section */}
                    {results.matches.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-3 text-foreground border-b border-card-border pb-4">
                                <Gamepad2 className="w-5 h-5 text-primary" />
                                Matches
                                <span className="text-xs bg-secondary text-primary px-2.5 py-1 rounded-full font-bold ml-auto border border-card-border">
                                    {results.matches.length}
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.matches.map((match) => (
                                    <MatchCard key={match.id} match={match} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container-custom py-16 text-center text-muted">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}
