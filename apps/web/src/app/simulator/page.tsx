"use client";

import { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import { domToPng } from "modern-screenshot";
import Image from "next/image";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    useDraggable,
    useDroppable
} from "@dnd-kit/core";
import { Team, Player, Transfer } from "@/types";
import PlayerSearchSidebar from "@/components/ui/PlayerSearchSidebar";
import TeamManagementModal from "@/components/ui/TeamManagementModal";
import OnboardingModal from "@/components/simulator/OnboardingModal";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { VideoGameSlug } from "@/infrastructure/pandascore/constants";
import { Users, UserMinus, Armchair, History, Trash2, Camera, Download, RotateCcw, Search, Settings } from "lucide-react";

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
            className={`flex items-center gap-3 p-2.5 rounded-lg bg-background border border-card-border hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50 ring-2 ring-primary z-50 shadow-lg" : ""}`}
        >
            <div className="w-8 h-8 rounded-full bg-secondary border border-card-border overflow-hidden flex-shrink-0 relative">
                {player.image_url ? (
                    <Image src={player.image_url} alt="" fill className="object-cover object-top" sizes="32px" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-[10px] font-bold text-muted-foreground">
                        {(player.name).charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {player.name}
                </span>
                {player.role && (
                    <RoleBadge role={player.role} size="sm" showLabel={true} />
                )}
            </div>
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
            className={`bg-card border rounded-xl p-5 relative group transition-all duration-300 ${isOver ? "border-primary ring-2 ring-primary/20 shadow-xl shadow-primary/10" : isHighlighted ? "border-primary/60 bg-primary/5" : "border-card-border hover:border-primary/30"}`}
        >
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 bg-background/80 rounded"
                    title="Delete team"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-card-border">
                <div className="w-12 h-12 flex items-center justify-center relative bg-secondary/30 rounded-lg p-2 filter drop-shadow-sm">
                    {team.image_url ? (
                        <Image
                            src={team.image_url}
                            alt=""
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                        />
                    ) : (
                        <span className="text-sm font-bold text-muted-foreground">{team.name.charAt(0)}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg uppercase tracking-tight truncate text-foreground leading-tight">{team.name}</h3>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                        <Users className="w-3 h-3" />
                        {team.players.length} Players
                    </p>
                </div>
            </div>

            {isOver && (
                <div className="mb-3 py-3 border border-dashed border-primary/50 rounded-lg text-center text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 animate-pulse">
                    Deposit Player
                </div>
            )}

            <div className="space-y-2 min-h-[50px]">
                {team.players.map((player) => (
                    <DraggablePlayer key={player.id} player={player} teamId={team.id} />
                ))}
                {team.players.length === 0 && !isOver && (
                    <p className="py-6 text-center text-muted-foreground text-xs uppercase tracking-widest font-medium border border-dashed border-card-border rounded-lg bg-secondary/20">
                        Empty
                    </p>
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
            className={`flex items-center gap-3 p-2.5 rounded-lg bg-background border border-card-border hover:border-yellow-500/50 hover:bg-yellow-500/5 cursor-grab active:cursor-grabbing transition-all ${isDragging ? "opacity-50 ring-2 ring-yellow-500" : ""}`}
        >
            <div className="w-8 h-8 rounded-full bg-secondary border border-card-border overflow-hidden flex-shrink-0 relative">
                {player.image_url ? (
                    <Image src={player.image_url} alt="" fill className="object-cover object-top" sizes="32px" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-background text-[10px] font-bold text-muted-foreground">
                        {(player.name).charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{player.name}</p>
                <p className="text-[10px] font-bold text-muted-foreground truncate opacity-70">[{player.originalTeam.name.slice(0, 3).toUpperCase()}]</p>
            </div>
        </div>
    );
});

// Draggable retired player
const DraggableRetiredPlayer = memo(function DraggableRetiredPlayer({
    player,
}: {
    player: Player;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: `retired-${player.id}`,
            data: { player, isRetired: true },
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
            className={`flex items-center gap-3 p-2.5 rounded-lg bg-background border border-card-border hover:border-red-500/50 hover:bg-red-500/5 cursor-grab active:cursor-grabbing transition-all ${isDragging ? "opacity-50 ring-2 ring-red-500 z-50" : "opacity-70 grayscale hover:grayscale-0 hover:opacity-100"}`}
        >
            <div className="w-6 h-6 rounded-full bg-secondary border border-card-border overflow-hidden flex-shrink-0 relative">
                {player.image_url ? (
                    <Image src={player.image_url} alt="" fill className="object-cover object-top" sizes="24px" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-background text-[10px] font-bold text-muted-foreground">
                        {(player.name).charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <span className="text-xs font-bold text-muted-foreground">{player.name}</span>
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
            className={`bg-card border rounded-xl p-5 transition-all duration-300 ${isOver ? "border-yellow-500 ring-2 ring-yellow-500/20 bg-yellow-500/5 shadow-lg" : "border-card-border"}`}
        >
            <div className="flex items-center gap-3 mb-4 border-b border-card-border pb-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Armchair className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                    <h3 className="font-display font-bold text-sm uppercase tracking-wide text-foreground">Bench</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{vacantPlayers.length} Players</p>
                </div>
            </div>

            {isOver && (
                <div className="mb-3 py-3 border border-dashed border-yellow-500/50 rounded-lg text-center text-xs font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/5 animate-pulse">
                    Bench Player
                </div>
            )}

            {vacantPlayers.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground text-xs uppercase tracking-widest font-medium border border-dashed border-card-border rounded-lg bg-secondary/20">-- Drop Here --</p>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent">
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
            className={`bg-card border rounded-xl p-5 transition-all duration-300 ${isOver ? "border-red-500 ring-2 ring-red-500/20 bg-red-500/5 shadow-lg" : "border-card-border"}`}
        >
            <div className="flex items-center gap-3 mb-4 border-b border-card-border pb-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                    <UserMinus className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <h3 className="font-display font-bold text-sm uppercase tracking-wide text-foreground">Retirement</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{retiredPlayers.length} Players</p>
                </div>
            </div>

            {isOver && (
                <div className="mb-3 py-3 border border-dashed border-red-500/50 rounded-lg text-center text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 animate-pulse">
                    Retire Player
                </div>
            )}

            {retiredPlayers.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground text-xs uppercase tracking-widest font-medium border border-dashed border-card-border rounded-lg bg-secondary/20">-- Drop Here --</p>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent">
                    {retiredPlayers.map((p) => (
                        <DraggableRetiredPlayer key={p.id} player={p} />
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
        <div className="flex items-center gap-3 p-3 bg-background border-b border-card-border group hover:bg-secondary/20 transition-colors last:border-0 relative">
            <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                {/* From Team Logo/Label */}
                <div className="w-6 h-6 flex items-center justify-center relative" title={fromTeam.name}>
                    {fromTeam.image_url ? (
                        <Image src={fromTeam.image_url} alt={fromTeam.name} fill className="object-contain" sizes="24px" />
                    ) : (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            {fromTeam.acronym || fromTeam.name.slice(0, 3)}
                        </span>
                    )}
                </div>

                <RotateCcw className="w-3 h-3 text-muted-foreground rotate-90" />

                {/* To Team Logo/Label */}
                <div className="w-6 h-6 flex items-center justify-center relative" title={toTeam.name}>
                    {toTeam.image_url ? (
                        <Image src={toTeam.image_url} alt={toTeam.name} fill className="object-contain" sizes="24px" />
                    ) : (
                        <span className="text-[10px] font-bold text-foreground uppercase">
                            {toTeam.acronym || toTeam.name.slice(0, 3)}
                        </span>
                    )}
                </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-secondary border border-card-border overflow-hidden flex-shrink-0 relative">
                {transfer.player.image_url ? (
                    <Image src={transfer.player.image_url} alt="" fill className="object-cover object-top" sizes="40px" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-background text-[10px] font-bold text-muted-foreground">
                        {(transfer.player.name).charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-foreground truncate">{transfer.player.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                    {new Date(transfer.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
            </div>

            <button
                onClick={onUndo}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-background border border-card-border rounded-md hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-muted-foreground shadow-sm"
                title="Undo transfer"
            >
                <RotateCcw className="w-3.5 h-3.5" />
            </button>
        </div>
    );
});

export default function SimulatorPage() {
    const [selectedGame, setSelectedGame] = useState<VideoGameSlug | null>("cs-2");
    const [onboardingOpen, setOnboardingOpen] = useState(false);

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
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [hiddenTeams, setHiddenTeams] = useState<Set<number>>(new Set());

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    useEffect(() => {
        setAllTeams([]);
        setLoading(false);
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem("paws-sim-v3");
        if (stored) {
            try {
                const { modifiedTeams: mt, transfers: tr, freeAgents: fa, retiredPlayers: rp, vacantPlayers: vp, customTeams: ct, hiddenTeams: ht, selectedGame: sg } = JSON.parse(stored);
                if (mt) setModifiedTeams(mt);
                if (tr) setTransfers(tr);
                if (fa) setFreeAgents(fa);
                if (rp) setRetiredPlayers(rp);
                if (vp) setVacantPlayers(vp);
                if (ct) setCustomTeams(ct);
                if (ht) setHiddenTeams(new Set(ht));
                if (sg) setSelectedGame(sg);

                if ((!mt || Object.keys(mt).length === 0) && (!ct || ct.length === 0) && (!fa || fa.length === 0)) {
                    setOnboardingOpen(true);
                }
            } catch {
                setOnboardingOpen(true);
            }
        } else {
            setOnboardingOpen(true);
        }
    }, []);

    useEffect(() => {
        if (loading) return;
        const timer = setTimeout(() => {
            localStorage.setItem("paws-sim-v3", JSON.stringify({
                modifiedTeams, transfers, freeAgents, retiredPlayers, vacantPlayers, customTeams,
                hiddenTeams: Array.from(hiddenTeams),
                selectedGame
            }));
        }, 500);
        return () => clearTimeout(timer);
    }, [modifiedTeams, transfers, freeAgents, retiredPlayers, vacantPlayers, customTeams, hiddenTeams, loading, selectedGame]);

    const getDisplayTeam = useCallback(
        (team: Team) => modifiedTeams[team.id] || team,
        [modifiedTeams]
    );

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
                if (existing.fromTeam.id === toTeamData.id) {
                    return prev.filter((_, i) => i !== existingIndex);
                }
                const next = [...prev];
                next[existingIndex] = { ...existing, toTeam: toTeamData, timestamp: Date.now() };
                return next;
            }

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

        let fromTeamData: any;
        if (isFreeAgent) {
            fromTeamData = player.currentTeam
                ? { ...player.currentTeam, slug: "ext", acronym: player.currentTeam.name.slice(0, 3).toUpperCase(), players: [], location: null }
                : { id: 0, name: "Free Agent", image_url: "", slug: "fa", acronym: "FA", players: [], location: null };
        } else if (isFromVacant) {
            fromTeamData = { ...originalTeam, slug: "vac", acronym: "VAC", players: [], location: null };
        } else if (active.data.current?.isRetired) {
            fromTeamData = { id: -1, name: "Retirement", image_url: "", slug: "ret", acronym: "RET", players: [], location: null };
        } else {
            const sourceTeam = getDisplayTeam(combinedTeams.find((t) => t.id === sourceTeamId)!);
            fromTeamData = sourceTeam;
        }

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

        if (overData.isRetirement) {
            const toTeamData = { id: -1, name: "Retirement", image_url: "", slug: "ret", acronym: "RET", players: [], location: null };

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
            } else if (active.data.current?.isRetired) {
                setModifiedTeams(prev => ({
                    ...prev,
                    [targetTeam.id]: { ...targetTeam, players: [...targetTeam.players, player] },
                }));
                setRetiredPlayers(prev => prev.filter(p => p.id !== player.id));
            } else {
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
        setAllTeams([]);
        setHiddenTeams(new Set());
        setSelectedGame(null);
        localStorage.removeItem("paws-sim-v3");
        setOnboardingOpen(true);
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

    function restoreTeam(teamId: number) {
        setHiddenTeams((prev) => {
            const next = new Set(prev);
            next.delete(teamId);
            return next;
        });
    }

    const teamsGridRef = useRef<HTMLDivElement>(null);
    const recapRef = useRef<HTMLDivElement>(null);

    async function exportAsImage() {
        if (!teamsGridRef.current) return;

        try {
            const dataUrl = await domToPng(teamsGridRef.current, {
                scale: 2,
                backgroundColor: '#09090b',
            });

            const link = document.createElement('a');
            link.download = `paws-rosters-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Error exporting image.');
        }
    }

    async function exportRecapAsImage() {
        if (!recapRef.current) return;

        try {
            const dataUrl = await domToPng(recapRef.current, {
                scale: 2,
                backgroundColor: '#09090b',
            });

            const link = document.createElement('a');
            link.download = `paws-transfers-recap-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Error exporting image.');
        }
    }

    const getProxiedUrl = useCallback((url: string | null) => {
        if (!url) return "";
        if (url.startsWith("/")) return url;
        return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary animate-pulse">
                <RotateCcw className="w-10 h-10 mb-4 animate-spin" />
                <span className="text-sm font-bold uppercase tracking-widest">Loading Simulator...</span>
            </div>
        );
    }

    return (
        <>
            <OnboardingModal
                isOpen={onboardingOpen}
                canClose={allTeams.length > 0 || customTeams.length > 0}
                onClose={() => setOnboardingOpen(false)}
                onComplete={(game: VideoGameSlug, teams: Team[]) => {
                    setSelectedGame(game);
                    setAllTeams(teams);
                    const modTeams: Record<number, Team> = {};
                    teams.forEach(t => { modTeams[t.id] = t; });
                    setModifiedTeams(modTeams);
                    setOnboardingOpen(false);
                }}
            />

            {/* Hidden Export Container for Recap */}
            <div
                ref={recapRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: '-9999px',
                    width: '800px',
                    zIndex: -100,
                    backgroundColor: '#09090b',
                }}
                className="p-10 text-white font-sans pointer-events-none"
            >
                <div className="text-center mb-10 border-b border-primary/20 pb-6">
                    <h1 className="text-4xl font-display font-bold uppercase tracking-widest text-white mb-2">
                        Transfer <span className="text-primary">Recap</span>
                    </h1>
                    <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Official Transaction Log</p>
                </div>

                {transfers.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 uppercase tracking-widest font-bold">No transfers recorded</div>
                ) : (
                    <div className="space-y-4">
                        {[...transfers].reverse().map((t) => (
                            <div key={t.id} className="relative flex items-center justify-between bg-[#18181b] p-6 rounded-xl border border-white/5 overflow-hidden">
                                <div className="absolute top-[4rem] left-0 w-full flex items-center justify-center z-0 px-32 pointer-events-none -translate-y-1/2 opacity-20">
                                    <div className="w-full h-[2px] bg-primary shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                </div>
                                <div className="flex flex-col items-center gap-3 w-32 z-10">
                                    <div className="w-20 h-20 flex items-center justify-center bg-black/20 rounded-xl p-2 border border-white/5">
                                        {t.fromTeam.image_url ? (
                                            <img src={getProxiedUrl(t.fromTeam.image_url)} crossOrigin="anonymous" alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-500">{t.fromTeam.acronym || t.fromTeam.name.slice(0, 3)}</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 font-bold uppercase text-center tracking-wide">{t.fromTeam.name}</span>
                                </div>
                                <div className="flex flex-col items-center z-10">
                                    <div className="relative mb-3">
                                        <div className="w-28 h-28 rounded-full bg-[#09090b] border-4 border-primary/20 overflow-hidden z-10 relative flex items-center justify-center shadow-2xl">
                                            {t.player.image_url ? (
                                                <img src={getProxiedUrl(t.player.image_url)} crossOrigin="anonymous" alt="" className="w-full h-full object-cover object-top" />
                                            ) : (
                                                <div className="text-2xl font-bold text-gray-500">{t.player.name.charAt(0)}</div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-2xl font-display font-bold uppercase tracking-wide">{t.player.name}</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 w-32 z-10">
                                    <div className="w-20 h-20 flex items-center justify-center bg-black/20 rounded-xl p-2 border border-white/5">
                                        {t.toTeam.image_url ? (
                                            <img src={getProxiedUrl(t.toTeam.image_url)} crossOrigin="anonymous" alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-2xl font-bold text-white">{t.toTeam.acronym || t.toTeam.name.slice(0, 3)}</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-primary font-bold uppercase text-center tracking-wide">{t.toTeam.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-8 pb-4 bg-background z-0 relative">
                <div className="container-custom flex items-center gap-4">
                    <h1 className="text-xl font-display font-bold uppercase tracking-wide text-foreground">
                        Transfer <span className="text-primary">Simulator</span>
                    </h1>
                </div>
            </div>

            <div className="bg-background relative z-0">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <header className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-y border-card-border py-4 shadow-sm">
                        <div className="container-custom flex items-center gap-6">
                            <div className="flex-1 flex items-center gap-4">
                                <div className="relative group flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Filter teams..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-card-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => setTeamModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all bg-card border-card-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-secondary"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Manage Teams</span>
                            </button>
                            <span className="hidden md:inline text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Transfers</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={resetAll}
                                    className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Reset</span>
                                </button>
                            </div>
                        </div>
                    </header>


                    <div className="container-custom py-4 md:py-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <PlayerSearchSidebar
                                freeAgents={freeAgents}
                                teams={displayTeams}
                                existingPlayerIds={getAllPlayerIds()}
                                selectedGame={selectedGame || "cs-2"}
                                onAddFreeAgent={(p: any) => setFreeAgents(prev => [p, ...prev])}
                                onRemoveFreeAgent={(pid) => setFreeAgents(prev => prev.filter(p => p.id !== pid))}
                            />
                            <div className="flex-1 min-w-0 order-last lg:order-none">
                                <div ref={teamsGridRef} className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 p-3 md:p-6 bg-secondary/10 rounded-2xl border border-card-border">
                                    {displayTeams.map((team) => (
                                        <TeamCard
                                            key={team.id}
                                            team={team}
                                            isHighlighted={transfers.some((t) => t.fromTeam.id === team.id || t.toTeam.id === team.id)}
                                            onRemove={() => removeTeam(team.id)}
                                        />
                                    ))}
                                </div>
                                <div className="mt-8 flex flex-wrap justify-center gap-4">
                                    <button
                                        onClick={exportAsImage}
                                        className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wide hover:bg-primary/90 transition-all rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5"
                                    >
                                        <Camera className="w-5 h-5" />
                                        Capture Rosters
                                    </button>
                                    <button
                                        onClick={exportRecapAsImage}
                                        className="flex items-center gap-2 px-8 py-3 bg-card border border-card-border text-foreground font-bold text-sm uppercase tracking-wide hover:bg-secondary transition-all rounded-xl shadow-sm hover:shadow-md"
                                    >
                                        <Download className="w-5 h-5" />
                                        Export Recap
                                    </button>
                                </div>
                            </div>
                            <div className="w-full xl:w-80 space-y-6 flex-shrink-0">
                                <VacantZone vacantPlayers={vacantPlayers} />
                                <RetirementZone retiredPlayers={retiredPlayers} />
                                <div ref={recapRef} className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4 border-b border-card-border pb-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <History className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-sm uppercase tracking-wide text-foreground">Activity</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{transfers.length} Events</p>
                                        </div>
                                    </div>
                                    {transfers.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-lg border border-dashed border-card-border">
                                            <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-xs uppercase tracking-widest font-medium">No Activity</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent">
                                            {[...transfers].reverse().map((t) => (
                                                <TransferItem key={t.id} transfer={t} onUndo={() => undoTransfer(t.id)} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DragOverlay dropAnimation={{
                        duration: 250,
                        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                    }}>
                        {activePlayer && (
                            <div className="bg-card border border-primary px-4 py-2 text-foreground font-bold text-sm shadow-xl rounded-full ring-2 ring-primary/20 flex items-center gap-3 transform scale-105 cursor-grabbing">
                                <div className="w-8 h-8 rounded-full bg-secondary border border-card-border overflow-hidden flex-shrink-0 relative">
                                    {activePlayer.image_url ? (
                                        <img src={activePlayer.image_url} alt="" className="w-full h-full object-cover object-top" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-background text-[10px] font-bold text-muted-foreground">
                                            {(activePlayer.name).charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {activePlayer.name}
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            <TeamManagementModal
                isOpen={teamModalOpen}
                onClose={() => setTeamModalOpen(false)}
                teams={combinedTeams}
                hiddenTeams={hiddenTeams}
                onAddTeam={addCustomTeam}
                onRemoveTeam={removeTeam}
                onRestoreTeam={restoreTeam}
            />
        </>
    );
}
