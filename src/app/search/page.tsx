"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import MatchCard from "@/components/ui/MatchCard";
import Link from "next/link";

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
                if (!res.ok) throw new Error("Search failed");
                const data = await res.json();
                setResults(data);
            } catch (err) {
                setError("Failed to fetch search results");
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [query]);

    if (!query) {
        return (
            <div className="container-custom py-16 text-center">
                <h1 className="text-2xl text-foreground">Please enter a search term</h1>
            </div>
        );
    }

    return (
        <div className="container-custom py-16">
            <h1 className="text-3xl font-display font-bold uppercase mb-8">
                Search Results for "<span className="text-primary">{query}</span>"
            </h1>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin text-4xl mb-4">🌀</div>
                    <p className="text-muted">Searching...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
            ) : (
                <div className="space-y-12">
                    {/* Tournaments Section */}
                    <section>
                        <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                            🏆 Tournaments
                            <span className="text-xs bg-card px-2 py-1 rounded text-muted font-normal ml-2">
                                {results.tournaments.length}
                            </span>
                        </h2>
                        {results.tournaments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.tournaments.map((tournament) => (
                                    <div key={tournament.id} className="bg-card border border-card-border p-6 rounded-lg hover:border-primary/50 transition-colors">
                                        <p className="text-xs text-muted uppercase mb-2">{tournament.league?.name}</p>
                                        <h3 className="text-lg font-bold text-foreground mb-4">{tournament.name}</h3>
                                        <div className="text-sm text-muted space-y-1">
                                            <p>📅 {new Date(tournament.begin_at).toLocaleDateString()} - {new Date(tournament.end_at).toLocaleDateString()}</p>
                                            <p>💰 {tournament.prizepool || "N/A"}</p>
                                            <p>🌍 {tournament.teams_count} Teams</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted italic">No tournaments found.</p>
                        )}
                    </section>

                    {/* Matches Section */}
                    <section>
                        <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                            🔫 Matches
                            <span className="text-xs bg-card px-2 py-1 rounded text-muted font-normal ml-2">
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
                            <p className="text-muted italic">No matches found.</p>
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
