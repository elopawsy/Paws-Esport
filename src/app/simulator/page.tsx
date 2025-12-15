"use client";

import { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import { domToPng } from "modern-screenshot";
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

interface VacantPlayer extends Player {
    originalTeam: { id: number; name: string; logo: string };
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
    onRemove,
}: {
    team: TeamFull;
    isHighlighted: boolean;
    onRemove?: () => void;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: `team-${team.id}`,
        data: { team },
    });

    return (
        <div
            ref={setNodeRef}
            className={`bg-neutral-900 border rounded-lg p-3 relative group ${isOver ? "border-cyan-600" : isHighlighted ? "border-orange-500" : "border-neutral-800"}`}
        >
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 hover:bg-red-500"
                >
                    ✕
                </button>
            )}
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
                        {(team.rank ?? 0) > 0 ? `#${team.rank} • ` : ""}{team.players.length} joueurs
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

// Draggable vacant player
const DraggableVacantPlayer = memo(function DraggableVacantPlayer({
    player,
}: {
    player: VacantPlayer;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: `vacant-${player.id}`,
            data: { player, isVacant: true, originalTeam: player.originalTeam },
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
            className={`flex items-center gap-2 p-1.5 rounded bg-black/50 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
        >
            <span className="text-xs text-neutral-400">{player.ign}</span>
            <span className="text-xs text-neutral-600">({player.originalTeam.name.slice(0, 3)})</span>
        </div>
    );
});

// Vacant zone - for temporarily removing players to free up spots
const VacantZone = memo(function VacantZone({
    vacantPlayers,
}: {
    vacantPlayers: VacantPlayer[];
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: "vacant-zone",
        data: { isVacant: true },
    });

    return (
        <div
            ref={setNodeRef}
            className={`bg-neutral-900 border rounded-lg p-3 ${isOver ? "border-yellow-500 bg-yellow-900/20" : "border-neutral-800"}`}
        >
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⏸️</span>
                <div>
                    <h3 className="font-semibold text-white text-sm">Vacant</h3>
                    <p className="text-xs text-neutral-500">{vacantPlayers.length} joueurs</p>
                </div>
            </div>

            {isOver && (
                <div className="mb-2 py-1.5 rounded border border-dashed border-yellow-500 text-center text-yellow-400 text-xs">
                    Mettre en vacant
                </div>
            )}

            {vacantPlayers.length === 0 ? (
                <p className="py-2 text-center text-neutral-600 text-xs">Glisse un joueur ici</p>
            ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                    {vacantPlayers.map((p) => (
                        <DraggableVacantPlayer key={p.id} player={p} />
                    ))}
                </div>
            )}
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
                : transfer.fromTeam.id === -2
                    ? "⏸️"
                    : transfer.fromTeam.name.slice(0, 3);
    const toLabel =
        transfer.toTeam.id === -1 ? "🏖️" : transfer.toTeam.id === -2 ? "⏸️" : transfer.toTeam.name.slice(0, 3);

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
    const [customTeams, setCustomTeams] = useState<TeamFull[]>([]);
    const [modifiedTeams, setModifiedTeams] = useState<Record<number, TeamFull>>({});
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [freeAgents, setFreeAgents] = useState<FreeAgentPlayer[]>([]);
    const [retiredPlayers, setRetiredPlayers] = useState<Player[]>([]);
    const [vacantPlayers, setVacantPlayers] = useState<VacantPlayer[]>([]);
    const [activePlayer, setActivePlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Team search state
    const [teamSearchQuery, setTeamSearchQuery] = useState("");
    const [teamSearchResults, setTeamSearchResults] = useState<TeamFull[]>([]);
    const [teamSearching, setTeamSearching] = useState(false);
    const [teamSearchOpen, setTeamSearchOpen] = useState(false);
    const [hiddenTeams, setHiddenTeams] = useState<Set<number>>(new Set());

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
                const { modifiedTeams: mt, transfers: tr, freeAgents: fa, retiredPlayers: rp, vacantPlayers: vp, customTeams: ct, hiddenTeams: ht } = JSON.parse(stored);
                if (mt) setModifiedTeams(mt);
                if (tr) setTransfers(tr);
                if (fa) setFreeAgents(fa);
                if (rp) setRetiredPlayers(rp);
                if (rp) setRetiredPlayers(rp);
                if (vp) {
                    // Migration script for old vacant players without originalTeam
                    const migratedVp = vp.map((p: any) => ({
                        ...p,
                        originalTeam: p.originalTeam || { id: 0, name: "Inconnu", logo: "" }
                    }));
                    setVacantPlayers(migratedVp);
                }
                if (ct) setCustomTeams(ct);
                if (ht) setHiddenTeams(new Set(ht));
            } catch { }
        }
    }, []);

    useEffect(() => {
        if (loading) return;
        const timer = setTimeout(() => {
            localStorage.setItem("cs-sim-v4", JSON.stringify({
                modifiedTeams, transfers, freeAgents, retiredPlayers, vacantPlayers, customTeams,
                hiddenTeams: Array.from(hiddenTeams)
            }));
        }, 500);
        return () => clearTimeout(timer);
    }, [modifiedTeams, transfers, freeAgents, retiredPlayers, vacantPlayers, customTeams, hiddenTeams, loading]);

    // Debounced team search
    useEffect(() => {
        if (teamSearchQuery.length < 2) {
            setTeamSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setTeamSearching(true);
            try {
                const res = await fetch(`/api/teams/search?q=${encodeURIComponent(teamSearchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter out teams already in list
                    const existingIds = new Set([...allTeams.map(t => t.id), ...customTeams.map(t => t.id)]);
                    setTeamSearchResults(data.filter((t: TeamFull) => !existingIds.has(t.id)));
                }
            } catch { }
            setTeamSearching(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [teamSearchQuery, allTeams, customTeams]);

    const getDisplayTeam = useCallback(
        (team: TeamFull) => modifiedTeams[team.id] || team,
        [modifiedTeams]
    );

    // Combine base teams + custom teams
    const combinedTeams = useMemo(
        () => [...allTeams, ...customTeams],
        [allTeams, customTeams]
    );

    const filteredTeams = useMemo(
        () => combinedTeams
            .filter((t) => !hiddenTeams.has(t.id))
            .filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [combinedTeams, hiddenTeams, searchTerm]
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

        const { player, teamId: sourceTeamId, isFreeAgent, isVacant: isFromVacant, originalTeam } = active.data.current as any;
        const overData = over.data.current as any;

        // Handle vacant - no history entry
        if (overData.isVacant) {
            if (isFreeAgent) {
                // Free agents going to vacant - store their current team or "FA"
                const vacantPlayer: VacantPlayer = {
                    ...player,
                    originalTeam: player.currentTeam || { id: 0, name: "Free Agent", logo: "" },
                };
                setFreeAgents((prev) => prev.filter((p) => p.id !== player.id));
                setVacantPlayers((prev) => [...prev, vacantPlayer]);
            } else if (!isFromVacant) {
                const sourceTeam = getDisplayTeam(combinedTeams.find((t) => t.id === sourceTeamId)!);
                const vacantPlayer: VacantPlayer = {
                    ...player,
                    originalTeam: { id: sourceTeam.id, name: sourceTeam.name, logo: sourceTeam.logo },
                };
                setModifiedTeams((prev) => ({
                    ...prev,
                    [sourceTeam.id]: { ...sourceTeam, players: sourceTeam.players.filter((p) => p.id !== player.id) },
                }));
                setVacantPlayers((prev) => [...prev, vacantPlayer]);
            }
            return;
        }

        // Handle retirement
        if (overData.isRetirement) {
            if (isFreeAgent) {
                setFreeAgents((prev) => prev.filter((p) => p.id !== player.id));
            } else if (isFromVacant) {
                setVacantPlayers((prev) => prev.filter((p) => p.id !== player.id));
            } else {
                const sourceTeam = getDisplayTeam(combinedTeams.find((t) => t.id === sourceTeamId)!);
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
                        : isFromVacant
                            ? originalTeam
                            : { id: sourceTeamId, name: combinedTeams.find((t) => t.id === sourceTeamId)?.name || "", logo: "" },
                    toTeam: { id: -1, name: "Retraite", logo: "" },
                    timestamp: Date.now(),
                },
            ]);
            return;
        }

        if (!overData.team) return;
        const targetTeam = getDisplayTeam(overData.team);

        // Handle from vacant to team - create history entry with original team
        if (isFromVacant) {
            setModifiedTeams((prev) => ({
                ...prev,
                [targetTeam.id]: { ...targetTeam, players: [...targetTeam.players, player] },
            }));
            setVacantPlayers((prev) => prev.filter((p) => p.id !== player.id));
            setTransfers((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-${player.id}`,
                    player,
                    fromTeam: originalTeam,
                    toTeam: { id: targetTeam.id, name: targetTeam.name, logo: targetTeam.logo },
                    timestamp: Date.now(),
                },
            ]);
            return;
        }

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

        const sourceTeam = getDisplayTeam(combinedTeams.find((t) => t.id === sourceTeamId)!);

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
                const fromTeam = getDisplayTeam(combinedTeams.find((t) => t.id === transfer.fromTeam.id)!);
                setModifiedTeams((prev) => ({
                    ...prev,
                    [fromTeam.id]: { ...fromTeam, players: [...fromTeam.players, transfer.player] },
                }));
            }
            setTransfers((prev) => prev.filter((t) => t.id !== id));
            return;
        }

        if (transfer.fromTeam.id === 0) {
            const toTeam = getDisplayTeam(combinedTeams.find((t) => t.id === transfer.toTeam.id)!);
            setModifiedTeams((prev) => ({
                ...prev,
                [toTeam.id]: { ...toTeam, players: toTeam.players.filter((p) => p.id !== transfer.player.id) },
            }));
            setFreeAgents((prev) => [...prev, transfer.player as FreeAgentPlayer]);
        } else {
            const fromTeam = getDisplayTeam(combinedTeams.find((t) => t.id === transfer.fromTeam.id)!);
            const toTeam = getDisplayTeam(combinedTeams.find((t) => t.id === transfer.toTeam.id)!);
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
        setVacantPlayers([]);
        setCustomTeams([]);
        setHiddenTeams(new Set());
        localStorage.removeItem("cs-sim-v4");
    }

    function addCustomTeam(team: TeamFull) {
        if (!customTeams.some((t) => t.id === team.id) && !allTeams.some((t) => t.id === team.id)) {
            setCustomTeams((prev) => [...prev, team]);
        }
        // Also unhide the team if it was hidden
        setHiddenTeams((prev) => {
            const next = new Set(prev);
            next.delete(team.id);
            return next;
        });
        setTeamSearchQuery("");
        setTeamSearchResults([]);
    }

    function removeTeam(teamId: number) {
        // For custom teams, remove them entirely
        if (customTeams.some((t) => t.id === teamId)) {
            setCustomTeams((prev) => prev.filter((t) => t.id !== teamId));
        } else {
            // For base teams, just hide them
            setHiddenTeams((prev) => new Set([...prev, teamId]));
        }
    }

    const teamsGridRef = useRef<HTMLDivElement>(null);

    async function exportAsImage() {
        if (!teamsGridRef.current) return;

        try {
            const dataUrl = await domToPng(teamsGridRef.current, {
                scale: 2,
                backgroundColor: '#000000',
            });

            const link = document.createElement('a');
            link.download = `cs2-transfers-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Erreur lors de l\'export. Veuillez réessayer.');
        }
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
                            placeholder="Filtrer équipes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-40 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none"
                        />

                        {/* Team search */}
                        <div className="relative">
                            <button
                                onClick={() => setTeamSearchOpen(!teamSearchOpen)}
                                className={`px-3 py-1.5 rounded text-sm ${teamSearchOpen ? "bg-blue-900/30 text-blue-400" : "bg-neutral-800 text-neutral-400"}`}
                            >
                                {teamSearchOpen ? "✕" : "+ Équipe"}
                            </button>

                            {teamSearchOpen && (
                                <div className="absolute top-full mt-2 right-0 w-72 bg-neutral-900 border border-neutral-800 rounded-lg p-3 z-50 shadow-xl">
                                    <input
                                        type="text"
                                        placeholder="Rechercher une équipe..."
                                        value={teamSearchQuery}
                                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                                        className="w-full px-2 py-1.5 bg-black border border-neutral-700 rounded text-sm text-white placeholder-neutral-600 focus:outline-none mb-2"
                                        autoFocus
                                    />

                                    {teamSearching && <p className="text-center text-neutral-500 text-xs">Recherche...</p>}

                                    {teamSearchResults.length > 0 && (
                                        <div className="max-h-48 overflow-y-auto space-y-1">
                                            {teamSearchResults.slice(0, 10).map((team) => (
                                                <div key={team.id} className="flex items-center gap-2 p-2 rounded bg-black hover:bg-neutral-800">
                                                    <div className="w-6 h-6 rounded bg-neutral-700 flex items-center justify-center overflow-hidden">
                                                        <img src={team.logo} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                    </div>
                                                    <span className="flex-1 text-sm text-white truncate">{team.name}</span>
                                                    <span className="text-xs text-neutral-500">{team.players.length}j</span>
                                                    <button
                                                        onClick={() => addCustomTeam(team)}
                                                        className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {teamSearchQuery.length >= 2 && !teamSearching && teamSearchResults.length === 0 && (
                                        <p className="text-center text-neutral-600 text-xs">Aucun résultat</p>
                                    )}

                                    {customTeams.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-neutral-800">
                                            <p className="text-xs text-neutral-500 mb-1">Équipes ajoutées ({customTeams.length})</p>
                                            <div className="flex flex-wrap gap-1">
                                                {customTeams.map((t) => (
                                                    <span key={t.id} className="text-xs bg-blue-900/20 text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        {t.name}
                                                        <button
                                                            onClick={() => setCustomTeams((prev) => prev.filter((team) => team.id !== t.id))}
                                                            className="hover:text-red-400"
                                                        >
                                                            ✕
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <span className="text-lg font-bold text-orange-500">{transfers.length}</span>
                            <span className="text-xs text-neutral-500 ml-1">transferts</span>
                        </div>
                        {(transfers.length > 0 || freeAgents.length > 0 || retiredPlayers.length > 0 || vacantPlayers.length > 0 || customTeams.length > 0 || hiddenTeams.size > 0) && (
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
                            <div ref={teamsGridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-2 bg-black">
                                {displayTeams.map((team) => (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        isHighlighted={transfers.some((t) => t.fromTeam.id === team.id || t.toTeam.id === team.id)}
                                        onRemove={() => removeTeam(team.id)}
                                    />
                                ))}
                            </div>

                            {/* Export Button */}
                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={exportAsImage}
                                    className="px-4 py-2 bg-green-900/30 text-green-400 rounded-lg text-sm hover:bg-green-900/50 flex items-center gap-2"
                                >
                                    📷 Exporter en image
                                </button>
                            </div>
                        </div>

                        <div className="w-64 flex-shrink-0 hidden xl:block space-y-4">
                            {/* Vacant Zone */}
                            <VacantZone vacantPlayers={vacantPlayers} />

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
