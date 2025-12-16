"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import MatchCard from "@/components/ui/MatchCard";
import Link from "next/link";
import { Search, Loader2, Trophy, Calendar, Coins, Users, Gamepad2 } from "lucide-react";

interface SearchResults {
    matches: any[];
    tournaments: any[];
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");
    const [results, setResults] = useState<SearchResults>({ matches: [], tournaments: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query) return;

        async function fetchResults() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query!)}`);
                if (!res.ok) throw new Error("Échec de la recherche");
                const data = await res.json();
                setResults(data);
            } catch (err) {
                setError("Impossible de récupérer les résultats");
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [query]);

    if (!query) {
        return (
            <div className="container-custom py-16 text-center">
                <h1 className="text-2xl text-foreground font-display uppercase tracking-wide">Veuillez entrer un terme de recherche</h1>
            </div>
        );
    }

    return (
        <div className="container-custom py-16">
            <h1 className="text-3xl font-display font-bold uppercase mb-12 flex items-center gap-3">
                <Search className="w-8 h-8 text-primary" />
                Résultats pour "<span className="text-primary">{query}</span>"
            </h1>

            {loading ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                    <div className="animate-spin text-primary mb-4 p-2 bg-primary/10 rounded-full">
                        <Loader2 className="w-8 h-8" />
                    </div>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Recherche en cours...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-500 font-bold bg-red-500/5 rounded-lg border border-red-500/20">{error}</div>
            ) : (
                <div className="space-y-16">
                    {/* Tournaments Section */}
                    <section>
                        <h2 className="text-xl font-bold uppercase mb-8 flex items-center gap-3 text-foreground border-b border-card-border pb-4">
                            <Trophy className="w-5 h-5 text-primary" />
                            Tournois
                            <span className="text-xs bg-secondary text-primary px-2.5 py-1 rounded-full font-bold ml-auto border border-card-border">
                                {results.tournaments.length}
                            </span>
                        </h2>
                        {results.tournaments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.tournaments.map((tournament) => (
                                    <Link key={tournament.id} href={`/tournaments/${tournament.id}`} className="group block h-full">
                                        <div className="bg-card border border-card-border p-6 rounded-xl hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider bg-secondary px-2 py-1 rounded border border-card-border group-hover:border-primary/20 transition-colors">
                                                    {tournament.league?.name}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-display font-bold text-foreground mb-6 group-hover:text-primary transition-colors leading-tight">
                                                {tournament.name}
                                            </h3>

                                            <div className="mt-auto space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4 text-primary/70" />
                                                    <span className="font-medium">
                                                        {new Date(tournament.begin_at).toLocaleDateString("fr-FR")}
                                                        {tournament.end_at && ` - ${new Date(tournament.end_at).toLocaleDateString("fr-FR")}`}
                                                    </span>
                                                </div>

                                                {tournament.prizepool && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Coins className="w-4 h-4 text-yellow-500/70" />
                                                        <span className="font-medium">{tournament.prizepool}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Users className="w-4 h-4 text-blue-400/70" />
                                                    <span className="font-medium">{tournament.teams_count || 0} Équipes</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-card-border rounded-xl bg-secondary/20">
                                <Trophy className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-muted-foreground font-medium">Aucun tournoi trouvé.</p>
                            </div>
                        )}
                    </section>

                    {/* Matches Section */}
                    <section>
                        <h2 className="text-xl font-bold uppercase mb-8 flex items-center gap-3 text-foreground border-b border-card-border pb-4">
                            <Gamepad2 className="w-5 h-5 text-primary" />
                            Matchs
                            <span className="text-xs bg-secondary text-primary px-2.5 py-1 rounded-full font-bold ml-auto border border-card-border">
                                {results.matches.length}
                            </span>
                        </h2>
                        {results.matches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.matches.map((match) => (
                                    <MatchCard key={match.id} match={match} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-card-border rounded-xl bg-secondary/20">
                                <Gamepad2 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-muted-foreground font-medium">Aucun match trouvé.</p>
                            </div>
                        )}
                    </section>
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
