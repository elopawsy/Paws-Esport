"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    Search,
    Loader2,
    Trophy,
    Users,
    Gamepad2,
    Zap,
    Clock,
    ArrowRight,
    X
} from "lucide-react";

interface SearchResult {
    type: "match" | "team" | "tournament";
    id: number;
    name: string;
    subtitle?: string;
    imageUrl?: string;
    status?: string;
    href: string;
    isLive?: boolean;
}

interface SearchSuggestion {
    matches: SearchResult[];
    tournaments: SearchResult[];
    teams: SearchResult[];
    liveEvents: SearchResult[];
}

export default function SearchBarWithSuggestions() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<SearchSuggestion>({
        matches: [],
        tournaments: [],
        teams: [],
        liveEvents: [],
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Fetch live events on focus (before typing)
    const fetchLiveEvents = useCallback(async () => {
        try {
            const res = await fetch("/api/matches?status=running&limit=5");
            if (res.ok) {
                const data = await res.json();
                const liveMatches = (data.live || data || []).slice(0, 5).map((match: any) => ({
                    type: "match" as const,
                    id: match.id,
                    name: match.name || `${match.opponents?.[0]?.team?.name || "TBD"} vs ${match.opponents?.[1]?.team?.name || "TBD"}`,
                    subtitle: match.tournament?.name || match.league?.name,
                    imageUrl: match.league?.image_url,
                    status: "Live",
                    href: `/match/${match.id}`,
                    isLive: true,
                }));
                setSuggestions((prev) => ({ ...prev, liveEvents: liveMatches }));
            }
        } catch (error) {
            console.error("Failed to fetch live events:", error);
        }
    }, []);

    // Search API
    const searchAll = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setSuggestions((prev) => ({
                ...prev,
                matches: [],
                tournaments: [],
                teams: []
            }));
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();

                // Transform matches
                const matches: SearchResult[] = (data.matches || []).slice(0, 5).map((m: any) => ({
                    type: "match",
                    id: m.id,
                    name: m.name,
                    subtitle: m.tournament?.name || m.league?.name || "",
                    imageUrl: m.league?.image_url,
                    status: m.status,
                    href: `/match/${m.id}`,
                    isLive: m.status === "running",
                }));

                // Transform tournaments
                const tournaments: SearchResult[] = (data.tournaments || []).slice(0, 5).map((t: any) => ({
                    type: "tournament",
                    id: t.id,
                    name: t.name,
                    subtitle: t.league?.name || t.serie?.name,
                    imageUrl: t.league?.image_url,
                    href: `/tournaments/${t.id}`,
                }));

                // Fetch teams separately
                let teams: SearchResult[] = [];
                try {
                    const teamsRes = await fetch(`/api/teams/search?q=${encodeURIComponent(searchQuery)}`);
                    if (teamsRes.ok) {
                        const teamsData = await teamsRes.json();
                        teams = teamsData.slice(0, 5).map((t: any) => ({
                            type: "team",
                            id: t.id,
                            name: t.name,
                            subtitle: t.location,
                            imageUrl: t.image_url,
                            href: `/teams/${t.id}`,
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch teams:", err);
                }

                setSuggestions((prev) => ({ ...prev, matches, tournaments, teams }));
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            searchAll(query);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, searchAll]);

    // Fetch live events on focus
    useEffect(() => {
        if (focused && query.length === 0) {
            fetchLiveEvents();
        }
    }, [focused, query, fetchLiveEvents]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setFocused(false);
        }
    };

    const hasResults =
        suggestions.liveEvents.length > 0 ||
        suggestions.matches.length > 0 ||
        suggestions.tournaments.length > 0 ||
        suggestions.teams.length > 0;

    const showDropdown = focused && (hasResults || loading || query.length === 0);

    return (
        <div ref={containerRef} className="relative hidden md:block">
            <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    placeholder="Search matches, teams, tournaments..."
                    className="bg-secondary/50 border border-card-border rounded-lg py-2 pl-4 pr-10 text-sm text-foreground focus:outline-none focus:border-primary/50 w-80 transition-all placeholder:text-muted-foreground"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                </button>
            </form>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-card-border rounded-xl shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
                    {/* Live Events Section (shown when no query) */}
                    {query.length === 0 && suggestions.liveEvents.length > 0 && (
                        <div className="p-2">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-primary uppercase tracking-wider">
                                <Zap className="w-3.5 h-3.5" />
                                Live Now
                            </div>
                            {suggestions.liveEvents.map((item) => (
                                <SuggestionItem key={`live-${item.id}`} item={item} onSelect={() => setFocused(false)} />
                            ))}
                        </div>
                    )}

                    {/* Search Results */}
                    {query.length >= 2 && (
                        <>
                            {/* Live/Running Matches */}
                            {suggestions.matches.filter(m => m.isLive).length > 0 && (
                                <div className="p-2 border-b border-card-border">
                                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 uppercase tracking-wider">
                                        <Zap className="w-3.5 h-3.5" />
                                        Live Matches
                                    </div>
                                    {suggestions.matches.filter(m => m.isLive).map((item) => (
                                        <SuggestionItem key={`match-${item.id}`} item={item} onSelect={() => setFocused(false)} />
                                    ))}
                                </div>
                            )}

                            {/* Other Matches */}
                            {suggestions.matches.filter(m => !m.isLive).length > 0 && (
                                <div className="p-2 border-b border-card-border">
                                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <Gamepad2 className="w-3.5 h-3.5" />
                                        Matches
                                    </div>
                                    {suggestions.matches.filter(m => !m.isLive).map((item) => (
                                        <SuggestionItem key={`match-${item.id}`} item={item} onSelect={() => setFocused(false)} />
                                    ))}
                                </div>
                            )}

                            {/* Teams */}
                            {suggestions.teams.length > 0 && (
                                <div className="p-2 border-b border-card-border">
                                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <Users className="w-3.5 h-3.5" />
                                        Teams
                                    </div>
                                    {suggestions.teams.map((item) => (
                                        <SuggestionItem key={`team-${item.id}`} item={item} onSelect={() => setFocused(false)} />
                                    ))}
                                </div>
                            )}

                            {/* Tournaments */}
                            {suggestions.tournaments.length > 0 && (
                                <div className="p-2">
                                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <Trophy className="w-3.5 h-3.5" />
                                        Tournaments
                                    </div>
                                    {suggestions.tournaments.map((item) => (
                                        <SuggestionItem key={`tournament-${item.id}`} item={item} onSelect={() => setFocused(false)} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="p-6 text-center text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                            <p className="text-sm">Searching...</p>
                        </div>
                    )}

                    {/* No results */}
                    {!loading && query.length >= 2 && !hasResults && (
                        <div className="p-6 text-center text-muted-foreground">
                            <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No results found for &quot;{query}&quot;</p>
                        </div>
                    )}

                    {/* View all results */}
                    {query.length >= 2 && hasResults && (
                        <Link
                            href={`/search?q=${encodeURIComponent(query)}`}
                            onClick={() => setFocused(false)}
                            className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors border-t border-card-border"
                        >
                            View all results
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}

                    {/* Empty state - suggestions */}
                    {query.length === 0 && suggestions.liveEvents.length === 0 && !loading && (
                        <div className="p-6 text-center text-muted-foreground">
                            <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Search for teams, matches, or tournaments</p>
                            <p className="text-xs mt-1 opacity-70">Try searching for &quot;Navi&quot;, &quot;Blast&quot;, or &quot;Major&quot;</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Suggestion Item Component
function SuggestionItem({ item, onSelect }: { item: SearchResult; onSelect: () => void }) {
    return (
        <Link
            href={item.href}
            onClick={onSelect}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors group"
        >
            {/* Image/Icon */}
            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0 border border-card-border overflow-hidden">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="object-contain p-1"
                    />
                ) : item.type === "team" ? (
                    <Users className="w-4 h-4 text-muted-foreground" />
                ) : item.type === "tournament" ? (
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {item.name}
                </p>
                {item.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                )}
            </div>

            {/* Status Badge */}
            {item.isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-500 text-xs font-bold rounded-full animate-pulse">
                    <Zap className="w-3 h-3" />
                    LIVE
                </span>
            )}
            {item.status && item.status !== "running" && (
                <span className="text-xs text-muted-foreground capitalize">{item.status}</span>
            )}
        </Link>
    );
}
