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
import { Team, Player, Transfer } from "@/lib/types";
import PlayerSearchSidebar from "@/components/ui/PlayerSearchSidebar";

interface FreeAgentPlayer extends Player {
    currentTeam: { id: number; name: string; image_url: string | null } | null;
}

interface VacantPlayer extends Player {
    originalTeam: { id: number; name: string; image_url: string | null };
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
            className={`flex items-center gap-3 p-2 rounded-sm bg-background border border-card-border hover:border-primary/50 hover:bg-card transition-colors cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50 ring-1 ring-primary" : ""}`}
        >
            <div className="w-8 h-8 rounded-full bg-background border border-card-border overflow-hidden flex-shrink-0">
                {player.image_url ? (
                    <img src={player.image_url} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-[10px] font-bold text-muted">
                         {(player.name).charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <span className="text-sm font-medium text-foreground truncate flex-1">
                {player.name}
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
    team: Team;
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
            className={`bg-card border rounded-md p-4 relative group transition-all duration-200 ${isOver ? "border-primary ring-1 ring-primary shadow-lg shadow-primary/10" : isHighlighted ? "border-primary/40 bg-secondary/80" : "border-card-border"}`}
        >
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                    ✕
                </button>
            )}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-card-border">
                <div className="w-10 h-10 flex items-center justify-center">
                    {team.image_url ? (
                        <img
                            src={team.image_url}
                            alt=""
                            className="w-full h-full object-contain"
                            loading="lazy"
                        />
                    ) : (
                         <span className="text-xs font-bold text-muted">{team.name.charAt(0)}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-base uppercase tracking-wide truncate text-foreground">{team.name}</h3>
                    <p className="text-[10px] text-primary uppercase tracking-wider font-medium">
                        {team.players.length} Players
                    </p>
                </div>
            </div>

            {isOver && (
                <div className="mb-2 py-2 border border-dashed border-primary/50 rounded-sm text-center text-xs text-primary uppercase tracking-widest bg-primary/5">
                    Drop Player
                </div>
            )}

            <div className="space-y-2">
                {team.players.map((player) => (
                    <DraggablePlayer key={player.id} player={player} teamId={team.id} />
                ))}
                {team.players.length === 0 && (
                    <p className="py-4 text-center text-muted text-xs uppercase tracking-widest">Empty</p>
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
            className={`flex items-center gap-2 p-2 rounded-sm bg-background border border-card-border cursor-grab active:cursor-grabbing hover:border-yellow-500/30 ${isDragging ? "opacity-50" : ""}`}
        >
            <div className="w-6 h-6 rounded-full bg-background border border-card-border overflow-hidden flex-shrink-0">
                 {player.image_url ? (
                    <img src={player.image_url} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-[10px] font-bold text-muted">
                         {(player.name).charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                <p className="text-[10px] text-muted truncate">[{player.originalTeam.name.slice(0, 3).toUpperCase()}]</p>
            </div>
        </div>
    );
});

// Vacant zone
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
            className={`bg-card border rounded-md p-4 transition-colors ${isOver ? "border-yellow-500/50 bg-yellow-500/5" : "border-card-border"}`}
        >
            <div className="flex items-center gap-2 mb-3 border-b border-card-border pb-2">
                <span className="text-lg">⏸️</span>
                <div>
                    <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-foreground">Bench</h3>
                    <p className="text-[10px] text-muted uppercase tracking-wider">{vacantPlayers.length} Players</p>
                </div>
            </div>

            {isOver && (
                <div className="mb-2 py-2 border border-dashed border-yellow-500/50 rounded-sm text-center text-xs text-yellow-500 uppercase tracking-widest">
                    Bench Player
                </div>
            )}

            {vacantPlayers.length === 0 ? (
                <p className="py-4 text-center text-muted text-xs uppercase tracking-widest">-- Drag Here --</p>
            ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
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
            className={`bg-card border rounded-md p-4 transition-colors ${isOver ? "border-red-500/50 bg-red-500/5" : "border-card-border"}`}
        >
            <div className="flex items-center gap-2 mb-3 border-b border-card-border pb-2">
                <span className="text-lg">🛑</span>
                <div>
                    <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-foreground">Retired</h3>
                    <p className="text-[10px] text-muted uppercase tracking-wider">{retiredPlayers.length} Players</p>
                </div>
            </div>

            {isOver && (
                <div className="mb-2 py-2 border border-dashed border-red-500/50 rounded-sm text-center text-xs text-red-500 uppercase tracking-widest">
                    Retire Player
                </div>
            )}

            {retiredPlayers.length === 0 ? (
                <p className="py-4 text-center text-muted text-xs uppercase tracking-widest">-- Drag Here --</p>
            ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {retiredPlayers.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 p-2 rounded-sm bg-background border border-card-border">
                             <div className="w-6 h-6 rounded-full bg-background border border-card-border overflow-hidden flex-shrink-0 grayscale">
                                {p.image_url ? (
                                    <img src={p.image_url} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-[10px] font-bold text-muted">
                                        {(p.name).charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-muted">{p.name}</span>
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
    const fromTeam = transfer.fromTeam;
    const toTeam = transfer.toTeam;

    return (
        <div className="flex items-center gap-3 p-3 bg-background border-b border-card-border group hover:bg-card transition-colors">
            <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                {/* From Team Logo/Label */}
                <div className="w-6 h-6 flex items-center justify-center" title={fromTeam.name}>
                    {fromTeam.image_url ? (
                        <img src={fromTeam.image_url} alt={fromTeam.name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-[10px] font-bold text-muted uppercase">
                            {fromTeam.acronym || fromTeam.name.slice(0, 3)}
                        </span>
                    )}
                </div>
                
                <span className="text-[10px] text-primary">↓</span>
                
                {/* To Team Logo/Label */}
                <div className="w-6 h-6 flex items-center justify-center" title={toTeam.name}>
                    {toTeam.image_url ? (
                        <img src={toTeam.image_url} alt={toTeam.name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-[10px] font-bold text-foreground uppercase">
                            {toTeam.acronym || toTeam.name.slice(0, 3)}
                        </span>
                    )}
                </div>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-background border border-card-border overflow-hidden flex-shrink-0">
                 {transfer.player.image_url ? (
                    <img src={transfer.player.image_url} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-[10px] font-bold text-muted">
                         {(transfer.player.name).charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <span className="flex-1 text-sm font-medium text-foreground truncate">{transfer.player.name}</span>
            
            <button
                onClick={onUndo}
                className="opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-wider text-muted hover:text-red-400 transition-all font-medium"
            >
                Undo
            </button>
        </div>
    );
});

export default function SimulatorPage() {
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [customTeams, setCustomTeams] = useState<Team[]>([]);
    const [modifiedTeams, setModifiedTeams] = useState<Record<number, Team>>({});
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [freeAgents, setFreeAgents] = useState<FreeAgentPlayer[]>([]);
    const [retiredPlayers, setRetiredPlayers] = useState<Player[]>([]);
    const [vacantPlayers, setVacantPlayers] = useState<VacantPlayer[]>([]);
    const [activePlayer, setActivePlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Team search state
    const [teamSearchQuery, setTeamSearchQuery] = useState("");
    const [teamSearchResults, setTeamSearchResults] = useState<Team[]>([]);
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
        const stored = localStorage.getItem("nexus-sim-v3"); // New version key for color update
        if (stored) {
            try {
                const { modifiedTeams: mt, transfers: tr, freeAgents: fa, retiredPlayers: rp, vacantPlayers: vp, customTeams: ct, hiddenTeams: ht } = JSON.parse(stored);
                if (mt) setModifiedTeams(mt);
                if (tr) setTransfers(tr);
                if (fa) setFreeAgents(fa);
                if (rp) setRetiredPlayers(rp);
                if (vp) setVacantPlayers(vp);
                if (ct) setCustomTeams(ct);
                if (ht) setHiddenTeams(new Set(ht));
            } catch { }
        }
    }, []);

    useEffect(() => {
        if (loading) return;
        const timer = setTimeout(() => {
            localStorage.setItem("nexus-sim-v3", JSON.stringify({
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
                    setTeamSearchResults(data.filter((t: Team) => !existingIds.has(t.id)));
                }
            } catch { }
            setTeamSearching(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [teamSearchQuery, allTeams, customTeams]);

    const getDisplayTeam = useCallback(
        (team: Team) => modifiedTeams[team.id] || team,
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

    const getAllPlayerIds = useCallback(() => {
        const ids = new Set<number>();
        displayTeams.forEach(t => t.players.forEach(p => ids.add(p.id)));
        freeAgents.forEach(p => ids.add(p.id));
        vacantPlayers.forEach(p => ids.add(p.id));
        retiredPlayers.forEach(p => ids.add(p.id));
        return ids;
    }, [displayTeams, freeAgents, vacantPlayers, retiredPlayers]);

    function handleDragStart(event: DragStartEvent) {
        setActivePlayer(event.active.data.current?.player || null);
    }
    
    function updateTransferLog(player: Player, fromTeamData: any, toTeamData: any) {
        setTransfers((prev) => {
            const existingIndex = prev.findIndex(t => t.player.id === player.id);
            if (existingIndex !== -1) {
                const existing = prev[existingIndex];
                // Check if returning to original source (Net zero move)
                // We compare IDs. Note: Bench is -2, Ret is -1, FA is 0.
                if (existing.fromTeam.id === toTeamData.id) {
                     return prev.filter((_, i) => i !== existingIndex);
                }
                // Update destination
                const next = [...prev];
                next[existingIndex] = { ...existing, toTeam: toTeamData, timestamp: Date.now() };
                return next;
            }
            
            // Create new
            // Avoid logging if source == dest
            if (fromTeamData.id === toTeamData.id) return prev;

            return [...prev, {
                id: `${Date.now()}-${player.id}`,
                player,
                fromTeam: fromTeamData,
                toTeam: toTeamData,
                timestamp: Date.now(),
            }];
        });
    }

    function handleDragEnd(event: DragEndEvent) {
        setActivePlayer(null);
        const { active, over } = event;
        if (!over) return;

        const { player, teamId: sourceTeamId, isFreeAgent, isVacant: isFromVacant, originalTeam } = active.data.current as any;
        const overData = over.data.current as any;

        // Determine Source Team Data (for new transfer records)
        let fromTeamData: any;
        if (isFreeAgent) {
             fromTeamData = player.currentTeam 
                ? { ...player.currentTeam, slug: "ext", acronym: player.currentTeam.name.slice(0, 3).toUpperCase(), players: [], location: null }
                : { id: 0, name: "Free Agent", image_url: "", slug: "fa", acronym: "FA", players: [], location: null };
        } else if (isFromVacant) {
             // If coming from vacant, we use the original team as source
             fromTeamData = { ...originalTeam, slug: "vac", acronym: "VAC", players: [], location: null };
        } else {
             // From a real team
             const sourceTeam = getDisplayTeam(combinedTeams.find((t) => t.id === sourceTeamId)!);
             fromTeamData = sourceTeam;
        }

        // 1. Handle Target: Vacant (Bench)
        if (overData.isVacant) {
            const toTeamData = { id: -2, name: "Bench", image_url: "", slug: "vac", acronym: "BENCH", players: [], location: null };
            
            if (isFreeAgent) {
                const vacantPlayer: VacantPlayer = { ...player, originalTeam: player.currentTeam || { id: 0, name: "Free Agent", image_url: "" } };
                setFreeAgents(prev => prev.filter(p => p.id !== player.id));
                setVacantPlayers(prev => [...prev, vacantPlayer]);
                updateTransferLog(player, fromTeamData, toTeamData);
            } else if (!isFromVacant) {
                const sourceTeam = getDisplayTeam(combinedTeams.find(t => t.id === sourceTeamId)!);
                const vacantPlayer: VacantPlayer = { ...player, originalTeam: { id: sourceTeam.id, name: sourceTeam.name, image_url: sourceTeam.image_url } };
                setModifiedTeams(prev => ({
                    ...prev,
                    [sourceTeam.id]: { ...sourceTeam, players: sourceTeam.players.filter(p => p.id !== player.id) },
                }));
                setVacantPlayers(prev => [...prev, vacantPlayer]);
                updateTransferLog(player, fromTeamData, toTeamData);
            }
            return;
        }

        // 2. Handle Target: Retirement
        if (overData.isRetirement) {
            const toTeamData = { id: -1, name: "Retraite", image_url: "", slug: "ret", acronym: "RET", players: [], location: null };

            if (isFreeAgent) {
                setFreeAgents(prev => prev.filter(p => p.id !== player.id));
            } else if (isFromVacant) {
                setVacantPlayers(prev => prev.filter(p => p.id !== player.id));
            } else {
                const sourceTeam = getDisplayTeam(combinedTeams.find(t => t.id === sourceTeamId)!);
                setModifiedTeams(prev => ({
                    ...prev,
                    [sourceTeam.id]: { ...sourceTeam, players: sourceTeam.players.filter(p => p.id !== player.id) },
                }));
            }
            setRetiredPlayers(prev => [...prev, player]);
            updateTransferLog(player, fromTeamData, toTeamData);
            return;
        }

        // 3. Handle Target: Team
        if (overData.team) {
            const targetTeam = getDisplayTeam(overData.team);
            if (sourceTeamId === targetTeam.id) return;

            if (isFromVacant) {
                setModifiedTeams(prev => ({
                    ...prev,
                    [targetTeam.id]: { ...targetTeam, players: [...targetTeam.players, player] },
                }));
                setVacantPlayers(prev => prev.filter(p => p.id !== player.id));
            } else if (isFreeAgent) {
                setModifiedTeams(prev => ({
                    ...prev,
                    [targetTeam.id]: { ...targetTeam, players: [...targetTeam.players, player] },
                }));
                setFreeAgents(prev => prev.filter(p => p.id !== player.id));
            } else {
                // Team to Team
                const sourceTeam = getDisplayTeam(combinedTeams.find(t => t.id === sourceTeamId)!);
                setModifiedTeams(prev => ({
                    ...prev,
                    [sourceTeam.id]: { ...sourceTeam, players: sourceTeam.players.filter(p => p.id !== player.id) },
                    [targetTeam.id]: { ...targetTeam, players: [...targetTeam.players, player] },
                }));
            }
            updateTransferLog(player, fromTeamData, targetTeam);
        }
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
        localStorage.removeItem("nexus-sim-v3");
    }

    function addCustomTeam(team: Team) {
        if (!customTeams.some((t) => t.id === team.id) && !allTeams.some((t) => t.id === team.id)) {
            setCustomTeams((prev) => [...prev, team]);
        }
        setHiddenTeams((prev) => {
            const next = new Set(prev);
            next.delete(team.id);
            return next;
        });
        setTeamSearchQuery("");
        setTeamSearchResults([]);
    }

    function removeTeam(teamId: number) {
        if (customTeams.some((t) => t.id === teamId)) {
            setCustomTeams((prev) => prev.filter((t) => t.id !== teamId));
        } else {
            setHiddenTeams((prev) => new Set([...prev, teamId]));
        }
    }

    const teamsGridRef = useRef<HTMLDivElement>(null);
    const recapRef = useRef<HTMLDivElement>(null);

    async function exportAsImage() {
        if (!teamsGridRef.current) return;

        try {
            const dataUrl = await domToPng(teamsGridRef.current, {
                scale: 2,
                backgroundColor: '#0f172a',
            });

            const link = document.createElement('a');
            link.download = `nexus-rosters-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Export malfunction.');
        }
    }

    async function exportRecapAsImage() {
        if (!recapRef.current) return;

        try {
            const dataUrl = await domToPng(recapRef.current, {
                scale: 2,
                backgroundColor: '#0f172a',
            });

            const link = document.createElement('a');
            link.download = `nexus-transfers-recap-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Export malfunction.');
        }
    }

    const getProxiedUrl = useCallback((url: string | null) => {
        if (!url) return "";
        if (url.startsWith("/")) return url;
        return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-muted text-sm font-medium uppercase tracking-widest">
                Loading Simulator...
            </div>
        );
    }

    return (
        <>
            {/* Hidden Export Container for Recap - Positioned behind app */}
            <div
                ref={recapRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '800px',
                    zIndex: -100,
                    backgroundColor: '#0f172a', // Force background color
                }}
                className="p-8 text-white font-sans pointer-events-none"
            >
                <div className="text-center mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-4xl font-display font-bold uppercase tracking-widest text-white mb-2">Transfer Market Recap</h1>
                    <p className="text-primary font-mono text-sm uppercase tracking-widest">Official Transaction Log</p>
                </div>

                {transfers.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 uppercase tracking-widest">No Transfers Recorded</div>
                ) : (
                    <div className="space-y-4">
                        {[...transfers].reverse().map((t) => (
                            <div key={t.id} className="relative flex items-center justify-between bg-[#1e293b] p-4 rounded border border-white/5 overflow-hidden">
                                
                                {/* Background Arrow */}
                                <div className="absolute top-[4rem] left-0 w-full flex items-center justify-center z-0 px-32 pointer-events-none -translate-y-1/2">
                                    <div className="w-full h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white -ml-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                {/* From Team */}
                                <div className="flex flex-col items-center gap-2 w-32 z-10">
                                    <div className="w-16 h-16 flex items-center justify-center">
                                        {t.fromTeam.image_url ? (
                                            <img 
                                                src={getProxiedUrl(t.fromTeam.image_url)} 
                                                crossOrigin="anonymous"
                                                alt="" 
                                                className="w-full h-full object-contain" 
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-500">{t.fromTeam.acronym || t.fromTeam.name.slice(0, 3)}</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 font-bold uppercase text-center">{t.fromTeam.name}</span>
                                </div>

                                {/* Player */}
                                <div className="flex flex-col items-center z-10">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-[#0f172a] border-2 border-white/20 overflow-hidden mb-2 z-10 relative flex items-center justify-center shadow-lg">
                                            {t.player.image_url ? (
                                                <img 
                                                    src={getProxiedUrl(t.player.image_url)} 
                                                    crossOrigin="anonymous"
                                                    alt="" 
                                                    className="w-full h-full object-cover object-top" 
                                                />
                                            ) : (
                                                <div className="text-2xl font-bold text-gray-500">
                                                    {t.player.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xl font-display font-bold uppercase tracking-wide">{t.player.name}</span>
                                </div>

                                {/* To Team */}
                                <div className="flex flex-col items-center gap-2 w-32 z-10">
                                    <div className="w-16 h-16 flex items-center justify-center">
                                        {t.toTeam.image_url ? (
                                            <img 
                                                src={getProxiedUrl(t.toTeam.image_url)} 
                                                crossOrigin="anonymous"
                                                alt="" 
                                                className="w-full h-full object-contain" 
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-white">{t.toTeam.acronym || t.toTeam.name.slice(0, 3)}</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-white font-bold uppercase text-center">{t.toTeam.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500 font-mono uppercase">
                    <span>Generated by Nexus Simulator</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="min-h-screen bg-background relative z-0">


                <header className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-card-border py-4">
                    <div className="max-w-[1800px] mx-auto px-6 flex items-center gap-6">
                        <div className="flex-1">
                            <h1 className="text-xl font-display font-semibold uppercase tracking-wide text-foreground">
                                Transfer <span className="text-primary">Sim</span>
                            </h1>
                        </div>
                        <input
                            type="text"
                            placeholder="Filter Teams..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-48 px-3 py-1.5 bg-card border border-card-border rounded-sm text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
                        />

                        {/* Team search */}
                        <div className="relative">
                            <button
                                onClick={() => setTeamSearchOpen(!teamSearchOpen)}
                                className={`px-3 py-1.5 rounded-sm text-xs font-medium uppercase tracking-wider border transition-colors ${teamSearchOpen ? "bg-primary text-white border-primary" : "bg-card border-card-border text-muted hover:text-foreground hover:border-muted"}`}
                            >
                                {teamSearchOpen ? "Close" : "+ Add Squad"}
                            </button>

                            {teamSearchOpen && (
                                <div className="absolute top-full mt-2 right-0 w-80 bg-card border border-card-border p-4 z-50 shadow-2xl rounded-md ring-1 ring-white/5">
                                    <input
                                        type="text"
                                        placeholder="Search Database..."
                                        value={teamSearchQuery}
                                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-card-border rounded-sm text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary mb-3"
                                        autoFocus
                                    />

                                    {teamSearching && <p className="text-center text-muted text-xs">Searching...</p>}

                                    {teamSearchResults.length > 0 && (
                                        <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                                            {teamSearchResults.slice(0, 10).map((team) => (
                                                <div key={team.id} className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer rounded-sm" onClick={() => addCustomTeam(team)}>
                                                    <div className="w-6 h-6 bg-white/5 flex items-center justify-center rounded-sm">
                                                        {team.image_url ? <img src={team.image_url} alt="" className="w-4 h-4 object-contain" /> : <span className="text-[10px] text-muted">{team.name.charAt(0)}</span>}
                                                    </div>
                                                    <span className="flex-1 text-sm font-medium text-foreground truncate">{team.name}</span>
                                                    <span className="text-xs text-primary">+</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <span className="text-lg font-bold text-primary">{transfers.length}</span>
                            <span className="text-[10px] text-muted ml-1 uppercase tracking-wider">Moves</span>
                        </div>
                        {(transfers.length > 0 || freeAgents.length > 0 || retiredPlayers.length > 0 || vacantPlayers.length > 0 || customTeams.length > 0 || hiddenTeams.size > 0) && (
                            <button
                                onClick={resetAll}
                                className="px-3 py-1.5 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10 rounded-sm uppercase tracking-wider transition-colors"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </header>

                <div className="max-w-[1800px] mx-auto px-6 py-8">
                    <div className="flex gap-6">
                        <PlayerSearchSidebar
                            freeAgents={freeAgents}
                            existingPlayerIds={getAllPlayerIds()}
                            onAddFreeAgent={(p) => {
                                const existing = getAllPlayerIds();
                                if (existing.has(p.id)) return;
                                setFreeAgents((prev) => [...prev, { ...p, currentTeam: p.currentTeam } as FreeAgentPlayer]);
                            }}
                            onRemoveFreeAgent={(id) => setFreeAgents((prev) => prev.filter((p) => p.id !== id))}
                        />

                        <div className="flex-1">

                            <div ref={teamsGridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6 bg-background rounded-lg border border-card-border shadow-inner">
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
                            <div className="mt-8 flex justify-center gap-4">
                                <button
                                    onClick={exportAsImage}
                                    className="px-6 py-2 bg-primary text-white font-medium text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-sm shadow-lg shadow-primary/20"
                                >
                                    Capture Rosters
                                </button>
                                <button
                                    onClick={exportRecapAsImage}
                                    className="px-6 py-2 bg-card border border-card-border text-white font-medium text-sm uppercase tracking-widest hover:bg-white/5 transition-colors rounded-sm"
                                >
                                    Export Recap
                                </button>
                            </div>
                        </div>

                        <div className="w-72 flex-shrink-0 hidden xl:block space-y-6">
                            {/* Vacant Zone */}
                            <VacantZone vacantPlayers={vacantPlayers} />

                            {/* Retirement Zone */}
                            <RetirementZone retiredPlayers={retiredPlayers} />

                            {/* Transfers History */}
                            <div className="sticky top-48 bg-card border border-card-border rounded-md shadow-sm">
                                <div className="px-4 py-3 border-b border-card-border bg-white/5 rounded-t-md">
                                    <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-foreground">Transfer Log</h3>
                                </div>
                                {transfers.length === 0 ? (
                                    <p className="p-6 text-center text-muted text-xs uppercase tracking-widest">No Activity</p>
                                ) : (
                                    <div className="max-h-[40vh] overflow-y-auto bg-background/50 rounded-b-md">
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
                        <div className="bg-card border border-primary px-3 py-1.5 text-white font-medium text-sm shadow-xl rounded-sm ring-1 ring-primary/20 flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-background border border-card-border overflow-hidden flex-shrink-0">
                                {activePlayer.image_url ? (
                                    <img src={activePlayer.image_url} alt="" className="w-full h-full object-cover object-top" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-[10px] font-bold text-muted">
                                        {(activePlayer.name).charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {activePlayer.name}
                        </div>
                    )}
                </DragOverlay>
            </div>
        </DndContext>
        </>
    );
}
