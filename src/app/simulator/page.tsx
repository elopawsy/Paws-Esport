"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { TeamFull, Player, Transfer } from "@/lib/types";
import PlayerSearchSidebar from "@/components/ui/PlayerSearchSidebar";

interface FreeAgentPlayer extends Player {
    currentTeam: { id: number; name: string; logo: string } | null;
}

// Memoized Player card
const DraggablePlayer = memo(function DraggablePlayer({
    player,
    teamId,
}: {
    player: Player;
    teamId: number;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: `player-${player.id}-${teamId}`,
            data: { player, teamId },
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
            className={`flex items-center gap-2 p-2 rounded bg-neutral-900 border border-neutral-800 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
        >
            <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500 flex-shrink-0">
                {(player.ign || player.name).charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-neutral-200 truncate flex-1">
                {player.ign || player.name}
            </span>
        </div>
    );
});

// Memoized Team card
const TeamCard = memo(function TeamCard({
    team,
    isHighlighted,
}: {
    team: TeamFull;
    isHighlighted: boolean;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: `team-${team.id}`,
        data: { team },
    });

    return (
        <div
            ref={setNodeRef}
            className={`bg-neutral-900 border rounded-lg p-3 ${isOver ? "border-cyan-600" : isHighlighted ? "border-orange-500" : "border-neutral-800"}`}
        >
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center overflow-hidden">
                    <img
                        src={team.logo}
                        alt=""
                        className="w-6 h-6 object-contain"
                        loading="lazy"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.parentElement!.innerHTML = `<span class="text-sm font-bold text-orange-500">${team.name.charAt(0)}</span>`;
                        }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{team.name}</h3>
                    <p className="text-xs text-neutral-500">
                        #{team.rank} • {team.players.length} joueurs
                    </p>
                </div>
            </div>

            {isOver && (
                <div className="mb-2 py-1.5 rounded border border-dashed border-cyan-600 text-center text-cyan-500 text-xs">
                    Déposer ici
                </div>
            )}

            <div className="space-y-1.5">
                {team.players.map((player) => (
                    <DraggablePlayer key={player.id} player={player} teamId={team.id} />
                ))}
                {team.players.length === 0 && (
                    <p className="py-3 text-center text-neutral-600 text-xs">Aucun joueur</p>
                )}
            </div>
        </div>
    );
});

// Retirement zone
const RetirementZone = memo(function RetirementZone({
    retiredPlayers,
}: {
    retiredPlayers: Player[];
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: "retirement-zone",
        data: { isRetirement: true },
    });

    return (
        <div
            ref={setNodeRef}
            className={`bg-neutral-900 border rounded-lg p-3 ${isOver ? "border-red-500 bg-red-900/20" : "border-neutral-800"}`}
        >
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏖️</span>
                <div>
                    <h3 className="font-semibold text-white text-sm">Retraite</h3>
                    <p className="text-xs text-neutral-500">{retiredPlayers.length} joueurs</p>
                </div>
            </div>

            {isOver && (
                <div className="mb-2 py-1.5 rounded border border-dashed border-red-500 text-center text-red-400 text-xs">
                    Prendre sa retraite
                </div>
            )}

            {retiredPlayers.length === 0 ? (
                <p className="py-2 text-center text-neutral-600 text-xs">Glisse un joueur ici</p>
            ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                    {retiredPlayers.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 p-1.5 rounded bg-black/50">
                            <span className="text-xs text-neutral-500">{p.ign}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

// Transfer item
const TransferItem = memo(function TransferItem({
    transfer,
    onUndo,
}: {
    transfer: Transfer;
    onUndo: () => void;
}) {
    const fromLabel =
        transfer.fromTeam.id === 0
            ? "FA"
            : transfer.fromTeam.id === -1
                ? "🏖️"
                : transfer.fromTeam.name.slice(0, 3);
    const toLabel =
        transfer.toTeam.id === -1 ? "🏖️" : transfer.toTeam.name.slice(0, 3);

    return (
        <div className="flex items-center gap-2 p-2 bg-neutral-900 rounded group">
            <span className="text-neutral-500 text-sm">{fromLabel}</span>
            <span className="text-neutral-600">→</span>
            <span className="text-neutral-300 text-sm">{toLabel}</span>
            <span className="flex-1 text-sm text-white truncate">{transfer.player.ign}</span>
            <button
                onClick={onUndo}
                className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 text-xs"
            >
                ✕
            </button>
        </div>
    );
});

export default function SimulatorPage() {
    const [allTeams, setAllTeams] = useState<TeamFull[]>([]);
    const [modifiedTeams, setModifiedTeams] = useState<Record<number, TeamFull>>({});
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [freeAgents, setFreeAgents] = useState<FreeAgentPlayer[]>([]);
    const [retiredPlayers, setRetiredPlayers] = useState<Player[]>([]);
    const [activePlayer, setActivePlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    useEffect(() => {
        fetch("/api/teams/all")
            .then((res) => res.json())
            .then(setAllTeams)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem("cs-sim-v4");
        if (stored) {
            try {
                const { modifiedTeams: mt, transfers: tr, freeAgents: fa, retiredPlayers: rp } = JSON.parse(stored);
                if (mt) setModifiedTeams(mt);
                if (tr) setTransfers(tr);
                if (fa) setFreeAgents(fa);
                if (rp) setRetiredPlayers(rp);
            } catch { }
        }
    }, []);

    useEffect(() => {
        if (loading) return;
        const timer = setTimeout(() => {
            localStorage.setItem("cs-sim-v4", JSON.stringify({ modifiedTeams, transfers, freeAgents, retiredPlayers }));
        }, 500);
        return () => clearTimeout(timer);
    }, [modifiedTeams, transfers, freeAgents, retiredPlayers, loading]);

    const getDisplayTeam = useCallback(
        (team: TeamFull) => modifiedTeams[team.id] || team,
        [modifiedTeams]
    );

    const filteredTeams = useMemo(
        () => allTeams.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [allTeams, searchTerm]
    );

    const displayTeams = useMemo(
        () => filteredTeams.map(getDisplayTeam),
        [filteredTeams, getDisplayTeam]
    );

    function handleDragStart(event: DragStartEvent) {
        setActivePlayer(event.active.data.current?.player || null);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActivePlayer(null);
        const { active, over } = event;
        if (!over) return;

        const { player, teamId: sourceTeamId, isFreeAgent } = active.data.current as any;
        const overData = over.data.current as any;

        // Handle retirement
        if (overData.isRetirement) {
            if (isFreeAgent) {
                setFreeAgents((prev) => prev.filter((p) => p.id !== player.id));
            } else {
                const sourceTeam = getDisplayTeam(allTeams.find((t) => t.id === sourceTeamId)!);
                setModifiedTeams((prev) => ({
                    ...prev,
                    [sourceTeam.id]: { ...sourceTeam, players: sourceTeam.players.filter((p) => p.id !== player.id) },
                }));
            }
            setRetiredPlayers((prev) => [...prev, player]);
            setTransfers((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-${player.id}`,
                    player,
                    fromTeam: isFreeAgent
                        ? { id: 0, name: "Free Agent", logo: "" }
                        : { id: sourceTeamId, name: allTeams.find((t) => t.id === sourceTeamId)?.name || "", logo: "" },
                    toTeam: { id: -1, name: "Retraite", logo: "" },
                    timestamp: Date.now(),
                },
            ]);
            return;
        }

        if (!overData.team) return;
        const targetTeam = getDisplayTeam(overData.team);

        if (isFreeAgent) {
            setModifiedTeams((prev) => ({
                ...prev,
                [targetTeam.id]: { ...targetTeam, players: [...targetTeam.players, player] },
            }));
            setFreeAgents((prev) => prev.filter((p) => p.id !== player.id));
            setTransfers((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-${player.id}`,
                    player,
                    fromTeam: { id: 0, name: "Free Agent", logo: "" },
                    toTeam: { id: targetTeam.id, name: targetTeam.name, logo: targetTeam.logo },
                    timestamp: Date.now(),
                },
            ]);
            return;
        }

        if (sourceTeamId === targetTeam.id) return;

        const sourceTeam = getDisplayTeam(allTeams.find((t) => t.id === sourceTeamId)!);

        setModifiedTeams((prev) => ({
            ...prev,
            [sourceTeam.id]: { ...sourceTeam, players: sourceTeam.players.filter((p) => p.id !== player.id) },
            [targetTeam.id]: { ...targetTeam, players: [...targetTeam.players, player] },
        }));

        setTransfers((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${player.id}`,
                player,
                fromTeam: { id: sourceTeam.id, name: sourceTeam.name, logo: sourceTeam.logo },
                toTeam: { id: targetTeam.id, name: targetTeam.name, logo: targetTeam.logo },
                timestamp: Date.now(),
            },
        ]);
    }

    function undoTransfer(id: string) {
        const transfer = transfers.find((t) => t.id === id);
        if (!transfer) return;

        // Undo retirement
        if (transfer.toTeam.id === -1) {
            setRetiredPlayers((prev) => prev.filter((p) => p.id !== transfer.player.id));
            if (transfer.fromTeam.id === 0) {
                setFreeAgents((prev) => [...prev, transfer.player as FreeAgentPlayer]);
            } else {
                const fromTeam = getDisplayTeam(allTeams.find((t) => t.id === transfer.fromTeam.id)!);
                setModifiedTeams((prev) => ({
                    ...prev,
                    [fromTeam.id]: { ...fromTeam, players: [...fromTeam.players, transfer.player] },
                }));
            }
            setTransfers((prev) => prev.filter((t) => t.id !== id));
            return;
        }

        if (transfer.fromTeam.id === 0) {
            const toTeam = getDisplayTeam(allTeams.find((t) => t.id === transfer.toTeam.id)!);
            setModifiedTeams((prev) => ({
                ...prev,
                [toTeam.id]: { ...toTeam, players: toTeam.players.filter((p) => p.id !== transfer.player.id) },
            }));
            setFreeAgents((prev) => [...prev, transfer.player as FreeAgentPlayer]);
        } else {
            const fromTeam = getDisplayTeam(allTeams.find((t) => t.id === transfer.fromTeam.id)!);
            const toTeam = getDisplayTeam(allTeams.find((t) => t.id === transfer.toTeam.id)!);
            setModifiedTeams((prev) => ({
                ...prev,
                [fromTeam.id]: { ...fromTeam, players: [...fromTeam.players, transfer.player] },
                [toTeam.id]: { ...toTeam, players: toTeam.players.filter((p) => p.id !== transfer.player.id) },
            }));
        }
        setTransfers((prev) => prev.filter((t) => t.id !== id));
    }

    function resetAll() {
        setModifiedTeams({});
        setTransfers([]);
        setFreeAgents([]);
        setRetiredPlayers([]);
        localStorage.removeItem("cs-sim-v4");
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-neutral-400">Chargement...</div>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="min-h-screen bg-black">
                <header className="sticky top-16 z-40 bg-black border-b border-neutral-800 py-3">
                    <div className="max-w-[1800px] mx-auto px-4 flex items-center gap-4">
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-white">
                                Simulateur <span className="text-orange-500">Transferts</span>
                            </h1>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-48 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none"
                        />
                        <div className="text-center">
                            <span className="text-lg font-bold text-orange-500">{transfers.length}</span>
                            <span className="text-xs text-neutral-500 ml-1">transferts</span>
                        </div>
                        {(transfers.length > 0 || freeAgents.length > 0 || retiredPlayers.length > 0) && (
                            <button
                                onClick={resetAll}
                                className="px-3 py-1.5 bg-red-900/30 text-red-400 rounded text-sm hover:bg-red-900/50"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </header>

                <div className="max-w-[1800px] mx-auto px-4 py-4">
                    <div className="flex gap-4">
                        <PlayerSearchSidebar
                            freeAgents={freeAgents}
                            onAddFreeAgent={(p) => !freeAgents.some((f) => f.id === p.id) && setFreeAgents((prev) => [...prev, p])}
                            onRemoveFreeAgent={(id) => setFreeAgents((prev) => prev.filter((p) => p.id !== id))}
                        />

                        <div className="flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {displayTeams.map((team) => (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        isHighlighted={transfers.some((t) => t.fromTeam.id === team.id || t.toTeam.id === team.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="w-64 flex-shrink-0 hidden xl:block space-y-4">
                            {/* Retirement Zone */}
                            <RetirementZone retiredPlayers={retiredPlayers} />

                            {/* Transfers History */}
                            <div className="sticky top-48 bg-neutral-900 border border-neutral-800 rounded-lg">
                                <div className="px-3 py-2 border-b border-neutral-800">
                                    <h3 className="font-semibold text-white text-sm">Historique</h3>
                                </div>
                                {transfers.length === 0 ? (
                                    <p className="p-4 text-center text-neutral-600 text-sm">Aucun transfert</p>
                                ) : (
                                    <div className="max-h-[40vh] overflow-y-auto p-2 space-y-1">
                                        {[...transfers].reverse().map((t) => (
                                            <TransferItem key={t.id} transfer={t} onUndo={() => undoTransfer(t.id)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activePlayer && (
                        <div className="bg-neutral-800 border border-cyan-600 rounded px-3 py-2 text-white text-sm font-medium shadow-lg">
                            {activePlayer.ign || activePlayer.name}
                        </div>
                    )}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
