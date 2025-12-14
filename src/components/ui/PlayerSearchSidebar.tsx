"use client";

import { useState, useEffect, memo } from "react";
import { Player } from "@/lib/types";
import { useDraggable } from "@dnd-kit/core";

interface SearchPlayer extends Player {
    currentTeam: { id: number; name: string; logo: string } | null;
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
            className={`flex items-center gap-2 p-2 rounded bg-neutral-900 border border-neutral-800 cursor-grab ${isDragging ? "opacity-50" : ""}`}
        >
            <div className="w-6 h-6 rounded-full bg-green-900/50 flex items-center justify-center text-xs font-bold text-green-400 flex-shrink-0">
                {player.ign.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{player.ign}</p>
                <p className="text-xs text-neutral-500 truncate">
                    {player.currentTeam?.name || "Free Agent"}
                </p>
            </div>
        </div>
    );
});

interface Props {
    freeAgents: SearchPlayer[];
    onAddFreeAgent: (player: SearchPlayer) => void;
    onRemoveFreeAgent: (playerId: number) => void;
}

export default function PlayerSearchSidebar({ freeAgents, onAddFreeAgent, onRemoveFreeAgent }: Props) {
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
                    setResults(data.filter((p: SearchPlayer) => !freeAgents.some((f) => f.id === p.id)));
                }
            } catch { }
            setSearching(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [query, freeAgents]);

    return (
        <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-32 bg-neutral-900 border border-neutral-800 rounded-lg">
                {/* Header */}
                <div className="px-3 py-2 border-b border-neutral-800 flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm">
                        Free Agents
                        {freeAgents.length > 0 && (
                            <span className="ml-2 text-xs text-green-400">({freeAgents.length})</span>
                        )}
                    </h3>
                </div>

                {/* Search toggle */}
                <div className="p-2 border-b border-neutral-800">
                    <button
                        onClick={() => setOpen(!open)}
                        className={`w-full px-3 py-1.5 rounded text-sm ${open ? "bg-green-900/30 text-green-400" : "bg-neutral-800 text-neutral-400"}`}
                    >
                        {open ? "✕ Fermer" : "🔍 Rechercher"}
                    </button>
                </div>

                {/* Search */}
                {open && (
                    <div className="p-2 border-b border-neutral-800 space-y-2">
                        <input
                            type="text"
                            placeholder="Nom du joueur..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full px-2 py-1.5 bg-black border border-neutral-700 rounded text-sm text-white placeholder-neutral-600 focus:outline-none"
                            autoFocus
                        />

                        {searching && <p className="text-center text-neutral-500 text-xs">Recherche...</p>}

                        {results.length > 0 && (
                            <div className="max-h-40 overflow-y-auto space-y-1">
                                {results.slice(0, 10).map((p) => (
                                    <div key={p.id} className="flex items-center gap-2 p-1.5 rounded bg-black">
                                        <span className="flex-1 text-sm text-white truncate">{p.ign}</span>
                                        <button
                                            onClick={() => {
                                                onAddFreeAgent(p);
                                                setQuery("");
                                                setResults([]);
                                            }}
                                            className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs"
                                        >
                                            +
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {query.length >= 2 && !searching && results.length === 0 && (
                            <p className="text-center text-neutral-600 text-xs">Aucun résultat</p>
                        )}
                    </div>
                )}

                {/* Free agents list */}
                <div className="max-h-[40vh] overflow-y-auto p-2">
                    {freeAgents.length === 0 ? (
                        <p className="py-4 text-center text-neutral-600 text-xs">
                            Recherchez des joueurs
                        </p>
                    ) : (
                        <div className="space-y-1.5">
                            {freeAgents.map((p) => (
                                <div key={p.id} className="group relative">
                                    <FreeAgentCard player={p} />
                                    <button
                                        onClick={() => onRemoveFreeAgent(p.id)}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {freeAgents.length > 0 && (
                    <div className="px-2 py-1.5 border-t border-neutral-800">
                        <p className="text-xs text-neutral-500 text-center">Glisse vers une équipe</p>
                    </div>
                )}
            </div>
        </div>
    );
}
