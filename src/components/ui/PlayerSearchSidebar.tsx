"use client";

import { useState, useEffect, memo } from "react";
import { Player } from "@/lib/types";
import { useDraggable } from "@dnd-kit/core";

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
            className={`flex items-center gap-3 p-2 border-b border-card-border hover:bg-white/5 cursor-grab transition-colors ${isDragging ? "opacity-50 ring-1 ring-primary" : ""}`}
        >
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-muted flex-shrink-0">
                {player.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                <p className="text-[10px] text-muted truncate uppercase tracking-wide">
                    {player.currentTeam?.name || "Free Agent"}
                </p>
            </div>
        </div>
    );
});

interface Props {
    freeAgents: SearchPlayer[];
    existingPlayerIds?: Set<number>;
    onAddFreeAgent: (player: SearchPlayer) => void;
    onRemoveFreeAgent: (playerId: number) => void;
}

export default function PlayerSearchSidebar({ freeAgents, existingPlayerIds, onAddFreeAgent, onRemoveFreeAgent }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchPlayer[]>([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.filter((p: SearchPlayer) => {
                        // Check local free agents list
                        if (freeAgents.some((f) => f.id === p.id)) return false;
                        // Check global existing players if provided
                        if (existingPlayerIds && existingPlayerIds.has(p.id)) return false;
                        return true;
                    }));
                }
            } catch { }
            setSearching(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [query, freeAgents, existingPlayerIds]);

    return (
        <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-32 bg-card border border-card-border rounded-md shadow-sm">
                {/* Header */}
                <div className="px-4 py-3 border-b border-card-border flex items-center justify-between bg-white/5 rounded-t-md">
                    <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-foreground">
                        Player Pool
                        {freeAgents.length > 0 && (
                            <span className="ml-2 text-primary font-bold">[{freeAgents.length}]</span>
                        )}
                    </h3>
                </div>

                {/* Search toggle */}
                <div className="p-2 border-b border-card-border">
                    <button
                        onClick={() => setOpen(!open)}
                        className={`w-full px-3 py-1.5 text-xs font-medium uppercase tracking-wider border rounded-sm transition-colors ${open ? "bg-primary text-white border-primary" : "bg-background border-card-border text-muted hover:text-foreground hover:border-muted"}`}
                    >
                        {open ? "Close Search" : "Import Player"}
                    </button>
                </div>

                {/* Search */}
                {open && (
                    <div className="p-3 border-b border-card-border space-y-3 bg-background/50">
                        <input
                            type="text"
                            placeholder="Enter Name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-card-border rounded-sm text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
                            autoFocus
                        />

                        {searching && <p className="text-center text-muted text-xs">Scanning...</p>}

                        {results.length > 0 && (
                            <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                                {results.slice(0, 10).map((p) => (
                                    <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer rounded-sm group">
                                        <span className="flex-1 text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{p.name}</span>
                                        <button
                                            onClick={() => {
                                                onAddFreeAgent(p);
                                                setQuery("");
                                                setResults([]);
                                            }}
                                            className="px-2 py-0.5 bg-primary/10 text-primary rounded-sm text-xs hover:bg-primary hover:text-white transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {query.length >= 2 && !searching && results.length === 0 && (
                            <p className="text-center text-muted text-xs uppercase tracking-wider">No Match</p>
                        )}
                    </div>
                )}

                {/* Free agents list */}
                <div className="max-h-[50vh] overflow-y-auto p-0 rounded-b-md">
                    {freeAgents.length === 0 ? (
                        <p className="py-8 text-center text-muted text-xs uppercase tracking-widest">
                            -- Idle --
                        </p>
                    ) : (
                        <div className="divide-y divide-card-border">
                            {freeAgents.map((p) => (
                                <div key={p.id} className="group relative">
                                    <FreeAgentCard player={p} />
                                    <button
                                        onClick={() => onRemoveFreeAgent(p.id)}
                                        className="absolute top-2 right-2 text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        ✕
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