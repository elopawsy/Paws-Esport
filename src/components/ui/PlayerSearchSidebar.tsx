"use client";

import { useState, useEffect, memo, useMemo } from "react";
import { Player, Team } from "@/types";
import { useDraggable } from "@dnd-kit/core";
import CountryFlag, { CS2_COUNTRIES } from "./CountryFlag";
import { Search, Globe, Users, Filter, X, Plus, AlertCircle, Loader2, LayoutGrid, List } from "lucide-react";
import Image from "next/image";

interface SearchPlayer extends Player {
    currentTeam: { id: number; name: string; image_url: string | null } | null;
}

// Memoized free agent card
const FreeAgentCard = memo(function FreeAgentCard({ player }: { player: SearchPlayer }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `freeagent-${player.id}`,
        data: { player, teamId: 0, isFreeAgent: true },
    });

    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`flex items-center gap-3 p-3 border-b border-card-border hover:bg-secondary/50 cursor-grab transition-all ${isDragging ? "opacity-50 ring-2 ring-primary bg-secondary shadow-xl z-50 rounded-lg" : ""}`}
        >
            <div className="w-8 h-8 rounded-lg bg-secondary border border-card-border flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0 overflow-hidden relative">
                {player.image_url ? (
                    <Image src={player.image_url} alt="" fill className="object-cover object-top" sizes="32px" />
                ) : (
                    player.name.charAt(0).toUpperCase()
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <CountryFlag code={player.nationality} size="sm" />
                    <p className="text-sm font-bold text-foreground truncate">{player.name}</p>
                </div>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wide font-medium">
                    {player.currentTeam?.name || "No Team"}
                </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Hidden drag handle indicator could go here */}
            </div>
        </div>
    );
});

interface Props {
    freeAgents: SearchPlayer[];
    existingPlayerIds?: Set<number>;
    teams?: Team[];
    selectedGame?: string;
    onAddFreeAgent: (player: SearchPlayer) => void;
    onRemoveFreeAgent: (playerId: number) => void;
}

export default function PlayerSearchSidebar({
    freeAgents,
    existingPlayerIds,
    teams = [],
    selectedGame = "cs-2",
    onAddFreeAgent,
    onRemoveFreeAgent
}: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchPlayer[]>([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);

    // Filters
    const [selectedCountry, setSelectedCountry] = useState("ALL");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [browseMode, setBrowseMode] = useState(false);
    const [browseResults, setBrowseResults] = useState<SearchPlayer[]>([]);
    const [browseLoading, setBrowseLoading] = useState(false);

    // Get available teams for dropdown
    const availableTeams = useMemo(() => {
        const teamMap = new Map<number, { id: number; name: string }>();
        teams.forEach(t => teamMap.set(t.id, { id: t.id, name: t.name }));
        return Array.from(teamMap.values());
    }, [teams]);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}&videogame=${selectedGame}`);
                if (res.ok) {
                    let data = await res.json();

                    // Apply local filters
                    if (selectedCountry !== "ALL") {
                        data = data.filter((p: SearchPlayer) => p.nationality === selectedCountry);
                    }
                    if (selectedTeam) {
                        data = data.filter((p: SearchPlayer) =>
                            p.currentTeam?.id?.toString() === selectedTeam
                        );
                    }

                    setResults(data.filter((p: SearchPlayer) => {
                        if (freeAgents.some((f) => f.id === p.id)) return false;
                        if (existingPlayerIds && existingPlayerIds.has(p.id)) return false;
                        return true;
                    }));
                }
            } catch { }
            setSearching(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [query, freeAgents, existingPlayerIds, selectedCountry, selectedTeam]);

    // Browse by filters (no search query)
    useEffect(() => {
        if (!browseMode) {
            setBrowseResults([]);
            return;
        }

        const fetchBrowse = async () => {
            setBrowseLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedCountry !== "ALL") {
                    params.set("nationality", selectedCountry);
                }
                if (selectedTeam) {
                    params.set("team", selectedTeam);
                }

                const res = await fetch(`/api/players/list?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setBrowseResults(data.players.filter((p: SearchPlayer) => {
                        if (freeAgents.some((f) => f.id === p.id)) return false;
                        if (existingPlayerIds && existingPlayerIds.has(p.id)) return false;
                        return true;
                    }));
                }
            } catch { }
            setBrowseLoading(false);
        };

        fetchBrowse();
    }, [browseMode, selectedCountry, selectedTeam, freeAgents, existingPlayerIds]);

    const displayResults = browseMode ? browseResults : results;

    return (
        <div className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-32 bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-4 py-4 border-b border-card-border flex items-center justify-between bg-primary/5">
                    <h3 className="font-display font-bold text-sm uppercase tracking-wide text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Player Pool
                        {freeAgents.length > 0 && (
                            <span className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">{freeAgents.length}</span>
                        )}
                    </h3>
                </div>

                {/* Search toggle */}
                <div className="p-3 border-b border-card-border bg-background">
                    <button
                        onClick={() => setOpen(!open)}
                        className={`w-full px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-lg transition-all flex items-center justify-center gap-2 ${open ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground border-card-border hover:text-foreground hover:border-primary/50"}`}
                    >
                        {open ? (
                            <><X className="w-3.5 h-3.5" /> Close Search</>
                        ) : (
                            <><Search className="w-3.5 h-3.5" /> Import Player</>
                        )}
                    </button>
                </div>

                {/* Search & Filters */}
                {open && (
                    <div className="p-4 border-b border-card-border space-y-4 bg-secondary/20 animate-in slide-in-from-top-2 duration-200">
                        {/* Mode toggle */}
                        <div className="flex bg-secondary p-1 rounded-lg border border-card-border">
                            <button
                                onClick={() => setBrowseMode(false)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${!browseMode ? "bg-card text-foreground shadow-sm ring-1 ring-black/5" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Search className="w-3 h-3" /> Search
                            </button>
                            <button
                                onClick={() => setBrowseMode(true)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${browseMode ? "bg-card text-foreground shadow-sm ring-1 ring-black/5" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <LayoutGrid className="w-3 h-3" /> Browse
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="space-y-3">
                            {/* Country filter */}
                            <div>
                                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-1.5 flex items-center gap-1.5">
                                    <Globe className="w-3 h-3" /> Nationality
                                </label>
                                <select
                                    value={selectedCountry}
                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors cursor-pointer"
                                >
                                    {CS2_COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.name} {c.code !== "ALL" ? `(${c.code})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Team filter */}
                            {availableTeams.length > 0 && (
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-1.5 flex items-center gap-1.5">
                                        <Users className="w-3 h-3" /> Team
                                    </label>
                                    <select
                                        value={selectedTeam}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors cursor-pointer"
                                    >
                                        <option value="">All Teams</option>
                                        {availableTeams.map(t => (
                                            <option key={t.id} value={t.id.toString()}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Search input (only in search mode) */}
                        {!browseMode && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Enter Name..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Loading */}
                        {(searching || browseLoading) && (
                            <div className="flex items-center justify-center py-2 text-primary">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                <span className="text-xs font-bold uppercase tracking-widest">Searching...</span>
                            </div>
                        )}

                        {/* Results */}
                        {displayResults.length > 0 && (
                            <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent pr-1">
                                {displayResults.slice(0, 15).map((p) => (
                                    <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer rounded-lg group border border-transparent hover:border-card-border transition-all">
                                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-secondary">
                                            {p.image_url && <Image src={p.image_url} alt="" fill className="object-cover" sizes="24px" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                    {p.name}
                                                </span>
                                                <CountryFlag code={p.nationality} size="sm" />
                                            </div>
                                            <div className="text-[10px] text-muted-foreground truncate">
                                                {p.currentTeam?.name || "No Team"}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                onAddFreeAgent(p);
                                                setQuery("");
                                                setResults([]);
                                            }}
                                            className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* No results */}
                        {!browseMode && query.length >= 2 && !searching && results.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground flex flex-col items-center">
                                <AlertCircle className="w-5 h-5 mb-1 opacity-50" />
                                <p className="text-xs uppercase tracking-widest font-bold">No Results</p>
                            </div>
                        )}
                        {browseMode && !browseLoading && browseResults.length === 0 && (selectedCountry !== "ALL" || selectedTeam) && (
                            <div className="text-center py-4 text-muted-foreground flex flex-col items-center">
                                <AlertCircle className="w-5 h-5 mb-1 opacity-50" />
                                <p className="text-xs uppercase tracking-widest font-bold">No Players Found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Free agents list */}
                <div className="max-h-[50vh] overflow-y-auto p-0 rounded-b-xl scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent">
                    {freeAgents.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                            <List className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-xs uppercase tracking-widest font-bold">
                                Empty List
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[150px]">
                                Add players here to prepare your transfers
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-card-border">
                            {freeAgents.map((p) => (
                                <div key={p.id} className="group relative">
                                    <FreeAgentCard player={p} />
                                    <button
                                        onClick={() => onRemoveFreeAgent(p.id)}
                                        className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-background/80 rounded-full p-1"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}