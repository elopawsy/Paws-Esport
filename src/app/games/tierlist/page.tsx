"use client";

import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
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
import { VIDEO_GAMES, type VideoGameSlug } from "@/types/videogame";
import { ChevronDown, Download, RotateCcw, Trophy, Gamepad2, Star, Trash2, Search, CheckCircle2, Loader2, ArrowRight, ChevronLeft, Settings, Plus, X } from "lucide-react";

interface Team {
    id: number;
    name: string;
    acronym?: string;
    image_url: string | null;
    players?: any[];
}

interface TierData {
    label: string;
    color: string;
    bgColor: string;
    teams: Team[];
}

const DEFAULT_TIERS: Record<string, Omit<TierData, 'teams'>> = {
    S: { label: "S", color: "text-red-500", bgColor: "bg-red-500/20 border-red-500/30" },
    A: { label: "A", color: "text-orange-500", bgColor: "bg-orange-500/20 border-orange-500/30" },
    B: { label: "B", color: "text-yellow-500", bgColor: "bg-yellow-500/20 border-yellow-500/30" },
    C: { label: "C", color: "text-green-500", bgColor: "bg-green-500/20 border-green-500/30" },
    D: { label: "D", color: "text-blue-500", bgColor: "bg-blue-500/20 border-blue-500/30" },
    F: { label: "F", color: "text-purple-500", bgColor: "bg-purple-500/20 border-purple-500/30" },
};

// ============ SETUP MODAL ============
interface SetupModalProps {
    isOpen: boolean;
    canClose: boolean;
    onComplete: (game: VideoGameSlug, teams: Team[]) => void;
    onClose: () => void;
}

const STEPS = {
    GAME_SELECTION: 0,
    TEAM_SELECTION: 1,
};

function SetupModal({ isOpen, canClose, onComplete, onClose }: SetupModalProps) {
    const [step, setStep] = useState(STEPS.GAME_SELECTION);
    const [selectedGame, setSelectedGame] = useState<VideoGameSlug | null>(null);
    const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

    const [activeTab, setActiveTab] = useState<"top" | "search">("top");
    const [topTeams, setTopTeams] = useState<Team[]>([]);
    const [loadingTop, setLoadingTop] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Team[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (step === STEPS.TEAM_SELECTION && selectedGame) {
            setLoadingTop(true);
            fetch(`/api/teams/top?videogame=${selectedGame}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setTopTeams(data);
                })
                .finally(() => setLoadingTop(false));
        }
    }, [step, selectedGame]);

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setIsSearching(true);
            fetch(`/api/teams/search?q=${encodeURIComponent(searchQuery)}&videogame=${selectedGame}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setSearchResults(data);
                })
                .finally(() => setIsSearching(false));
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedGame]);

    if (!isOpen) return null;

    const handleGameSelect = (slug: VideoGameSlug) => {
        setSelectedGame(slug);
        setStep(STEPS.TEAM_SELECTION);
    };

    const toggleTeam = (team: Team) => {
        if (selectedTeams.some(t => t.id === team.id)) {
            setSelectedTeams(prev => prev.filter(t => t.id !== team.id));
        } else {
            setSelectedTeams(prev => [...prev, team]);
        }
    };

    const handleBack = () => {
        if (step === STEPS.TEAM_SELECTION) {
            setStep(STEPS.GAME_SELECTION);
            setSelectedTeams([]);
        }
    };

    const handleFinish = () => {
        if (selectedGame && selectedTeams.length > 0) {
            onComplete(selectedGame, selectedTeams);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-card-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3"></div>

                {/* Header */}
                <div className="p-6 border-b border-card-border flex items-center justify-between shrink-0 bg-background/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        {step === STEPS.TEAM_SELECTION && (
                            <button onClick={handleBack} className="p-1 -ml-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Star className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-foreground">Setup Tier List</h2>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                {step === STEPS.GAME_SELECTION ? "Select a Game" : "Select Teams to Rank"}
                            </p>
                        </div>
                    </div>
                    {canClose && (
                        <button onClick={onClose} className="text-sm font-bold text-muted-foreground hover:text-foreground">
                            SKIP
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent">
                    {step === STEPS.GAME_SELECTION && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.values(VIDEO_GAMES).map((game) => (
                                <button
                                    key={game.slug}
                                    onClick={() => handleGameSelect(game.slug as VideoGameSlug)}
                                    className="group relative flex flex-col items-center gap-4 p-6 bg-secondary/30 hover:bg-secondary border border-card-border hover:border-primary/50 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 text-center"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-background to-secondary shadow-inner flex items-center justify-center border border-card-border group-hover:border-primary/30 group-hover:scale-110 transition-all duration-500">
                                        <span className="text-xl font-display font-bold text-foreground/80 group-hover:text-primary transition-colors">
                                            {game.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{game.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide opacity-60 group-hover:opacity-100 transition-opacity">Select Game</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {step === STEPS.TEAM_SELECTION && (
                        <div className="flex flex-col h-full gap-6">
                            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                                <div className="flex p-1 bg-secondary rounded-lg border border-card-border self-start">
                                    <button
                                        onClick={() => setActiveTab("top")}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === "top" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        <Trophy className="w-3.5 h-3.5 inline-block mr-2 -mt-0.5" />
                                        Top Teams
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("search")}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === "search" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        <Search className="w-3.5 h-3.5 inline-block mr-2 -mt-0.5" />
                                        Search
                                    </button>
                                </div>
                                {activeTab === "search" && (
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search teams..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-h-0">
                                {activeTab === "top" && loadingTop ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-primary">
                                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Loading Rankings...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-2">
                                        {(activeTab === "top" ? topTeams : searchResults).map((team) => {
                                            const isSelected = selectedTeams.some(t => t.id === team.id);
                                            return (
                                                <button
                                                    key={team.id}
                                                    onClick={() => toggleTeam(team)}
                                                    className={`group relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 text-center ${isSelected ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(var(--primary),1)]" : "bg-card border-card-border hover:border-primary/50 hover:bg-secondary/50"}`}
                                                >
                                                    <div className="w-12 h-12 relative flex items-center justify-center bg-secondary/30 rounded-lg p-2 filter drop-shadow-sm">
                                                        {team.image_url ? (
                                                            <Image src={team.image_url} alt={team.name} fill className="object-contain p-1" sizes="48px" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-muted-foreground">{team.name.charAt(0)}</span>
                                                        )}
                                                        {isSelected && (
                                                            <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="w-full">
                                                        <p className="text-xs font-bold text-foreground truncate w-full">{team.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Team</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {activeTab === "search" && !isSearching && searchResults.length === 0 && searchQuery.length > 2 && (
                                            <div className="col-span-full pt-10 text-center text-muted-foreground text-sm">
                                                No teams found.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === STEPS.TEAM_SELECTION && (
                    <div className="p-4 border-t border-card-border bg-background/50 backdrop-blur-md flex items-center justify-between shrink-0">
                        <div className="text-sm font-medium">
                            <span className="text-primary font-bold">{selectedTeams.length}</span> <span className="text-muted-foreground">Teams Selected</span>
                        </div>
                        <button
                            onClick={handleFinish}
                            disabled={selectedTeams.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Ranking <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ ADD TEAMS MODAL ============
interface AddTeamsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (teams: Team[]) => void;
    selectedGame: VideoGameSlug;
    existingTeamIds: Set<number>;
}

function AddTeamsModal({ isOpen, onClose, onAdd, selectedGame, existingTeamIds }: AddTeamsModalProps) {
    const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
    const [activeTab, setActiveTab] = useState<"top" | "search">("top");
    const [topTeams, setTopTeams] = useState<Team[]>([]);
    const [loadingTop, setLoadingTop] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Team[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoadingTop(true);
            setSelectedTeams([]);
            fetch(`/api/teams/top?videogame=${selectedGame}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setTopTeams(data);
                })
                .finally(() => setLoadingTop(false));
        }
    }, [isOpen, selectedGame]);

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setIsSearching(true);
            fetch(`/api/teams/search?q=${encodeURIComponent(searchQuery)}&videogame=${selectedGame}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setSearchResults(data);
                })
                .finally(() => setIsSearching(false));
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedGame]);

    if (!isOpen) return null;

    const toggleTeam = (team: Team) => {
        if (selectedTeams.some(t => t.id === team.id)) {
            setSelectedTeams(prev => prev.filter(t => t.id !== team.id));
        } else {
            setSelectedTeams(prev => [...prev, team]);
        }
    };

    const handleAdd = () => {
        if (selectedTeams.length > 0) {
            onAdd(selectedTeams);
            onClose();
        }
    };

    // Filter out already existing teams
    const filterExisting = (teams: Team[]) => teams.filter(t => !existingTeamIds.has(t.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-card-border w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-card-border flex items-center justify-between shrink-0 bg-background/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-display font-bold text-foreground">Add Teams</h2>
                            <p className="text-xs text-muted-foreground">Add more teams to your tier list</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex p-1 bg-secondary rounded-lg border border-card-border self-start">
                            <button
                                onClick={() => setActiveTab("top")}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === "top" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Trophy className="w-3.5 h-3.5 inline-block mr-2 -mt-0.5" />
                                Top Teams
                            </button>
                            <button
                                onClick={() => setActiveTab("search")}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === "search" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Search className="w-3.5 h-3.5 inline-block mr-2 -mt-0.5" />
                                Search
                            </button>
                        </div>
                        {activeTab === "search" && (
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search teams..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary"
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    {loadingTop && activeTab === "top" ? (
                        <div className="flex flex-col items-center justify-center h-40 text-primary">
                            <Loader2 className="w-8 h-8 animate-spin mb-3" />
                            <span className="text-xs font-bold uppercase tracking-widest">Loading...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {filterExisting(activeTab === "top" ? topTeams : searchResults).map((team) => {
                                const isSelected = selectedTeams.some(t => t.id === team.id);
                                return (
                                    <button
                                        key={team.id}
                                        onClick={() => toggleTeam(team)}
                                        className={`group relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 text-center ${isSelected ? "bg-primary/10 border-primary" : "bg-card border-card-border hover:border-primary/50 hover:bg-secondary/50"}`}
                                    >
                                        <div className="w-10 h-10 relative flex items-center justify-center bg-secondary/30 rounded-lg p-1">
                                            {team.image_url ? (
                                                <Image src={team.image_url} alt={team.name} fill className="object-contain p-1" sizes="40px" />
                                            ) : (
                                                <span className="text-xs font-bold text-muted-foreground">{team.name.charAt(0)}</span>
                                            )}
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-foreground truncate w-full">{team.name}</p>
                                    </button>
                                );
                            })}
                            {activeTab === "top" && filterExisting(topTeams).length === 0 && !loadingTop && (
                                <div className="col-span-full text-center text-muted-foreground py-8">
                                    All top teams already added!
                                </div>
                            )}
                            {activeTab === "search" && !isSearching && filterExisting(searchResults).length === 0 && searchQuery.length > 2 && (
                                <div className="col-span-full text-center text-muted-foreground py-8">
                                    No new teams found.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-card-border bg-background/50 flex items-center justify-between">
                    <div className="text-sm">
                        <span className="text-primary font-bold">{selectedTeams.length}</span>
                        <span className="text-muted-foreground"> new teams selected</span>
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={selectedTeams.length === 0}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                        Add Teams
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============ TIER LIST COMPONENTS ============
const DraggableTeam = memo(function DraggableTeam({
    team,
    tierId,
}: {
    team: Team;
    tierId: string;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `team-${team.id}-${tierId}`,
        data: { team, tierId },
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
            className={`flex flex-col items-center gap-1 p-2 rounded-lg bg-background border border-card-border hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50 ring-2 ring-primary z-50 shadow-lg" : ""}`}
        >
            <div className="w-12 h-12 rounded-lg bg-secondary border border-card-border overflow-hidden flex items-center justify-center relative">
                {team.image_url ? (
                    <Image src={team.image_url} alt={team.name} fill className="object-contain p-1" sizes="48px" />
                ) : (
                    <span className="text-xs font-bold text-muted-foreground">{team.acronym || team.name.slice(0, 3)}</span>
                )}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground text-center truncate max-w-[60px]">
                {team.acronym || team.name.slice(0, 6)}
            </span>
        </div>
    );
});

const TierRow = memo(function TierRow({
    tierId,
    tier,
    onRemoveTeam,
}: {
    tierId: string;
    tier: TierData;
    onRemoveTeam: (teamId: number) => void;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: `tier-${tierId}`,
        data: { tierId },
    });

    return (
        <div className={`flex items-stretch border rounded-lg overflow-hidden transition-all ${isOver ? "ring-2 ring-primary shadow-lg" : "border-card-border"}`}>
            <div className={`w-16 flex-shrink-0 flex items-center justify-center font-display font-bold text-2xl ${tier.bgColor} ${tier.color} border-r border-card-border`}>
                {tier.label}
            </div>
            <div
                ref={setNodeRef}
                className={`flex-1 flex flex-wrap gap-2 p-3 min-h-[80px] bg-card transition-colors ${isOver ? "bg-primary/5" : ""}`}
            >
                {tier.teams.map((team) => (
                    <div key={team.id} className="relative group">
                        <DraggableTeam team={team} tierId={tierId} />
                        <button
                            onClick={() => onRemoveTeam(team.id)}
                            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                {tier.teams.length === 0 && !isOver && (
                    <p className="w-full text-center text-xs text-muted-foreground uppercase tracking-wider py-4">Drop teams here</p>
                )}
            </div>
        </div>
    );
});

const UnrankedPool = memo(function UnrankedPool({
    teams,
}: {
    teams: Team[];
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: "unranked",
        data: { tierId: "unranked" },
    });

    return (
        <div className={`bg-card border rounded-xl p-4 transition-all ${isOver ? "border-primary ring-2 ring-primary/20" : "border-card-border"}`}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-card-border">
                <Star className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-sm uppercase tracking-wide">Available Teams</h3>
                <span className="ml-auto text-xs text-muted-foreground font-bold">{teams.length} teams</span>
            </div>
            <div
                ref={setNodeRef}
                className={`flex flex-wrap gap-2 min-h-[100px] max-h-[300px] overflow-y-auto ${isOver ? "bg-primary/5 rounded-lg" : ""}`}
            >
                {teams.map((team) => (
                    <DraggableTeam key={team.id} team={team} tierId="unranked" />
                ))}
                {teams.length === 0 && (
                    <p className="w-full text-center text-xs text-muted-foreground uppercase tracking-wider py-8">All teams ranked!</p>
                )}
            </div>
        </div>
    );
});

// ============ MAIN PAGE ============
export default function TierListPage() {
    const [setupOpen, setSetupOpen] = useState(false);
    const [addTeamsOpen, setAddTeamsOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState<VideoGameSlug | null>(null);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [tiers, setTiers] = useState<Record<string, TierData>>({
        S: { ...DEFAULT_TIERS.S, teams: [] },
        A: { ...DEFAULT_TIERS.A, teams: [] },
        B: { ...DEFAULT_TIERS.B, teams: [] },
        C: { ...DEFAULT_TIERS.C, teams: [] },
        D: { ...DEFAULT_TIERS.D, teams: [] },
        F: { ...DEFAULT_TIERS.F, teams: [] },
    });
    const [unrankedTeams, setUnrankedTeams] = useState<Team[]>([]);
    const [activeTeam, setActiveTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);

    const tierListRef = useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("paws-tierlist-v2");
        if (stored) {
            try {
                const { selectedGame: sg, allTeams: at, tiers: t, unrankedTeams: ut } = JSON.parse(stored);
                if (sg && at && at.length > 0) {
                    setSelectedGame(sg);
                    setAllTeams(at);
                    setTiers(t);
                    setUnrankedTeams(ut);
                    setLoading(false);
                    return;
                }
            } catch {
                // Invalid data, show setup
            }
        }
        setSetupOpen(true);
        setLoading(false);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (loading || !selectedGame || allTeams.length === 0) return;
        const timer = setTimeout(() => {
            localStorage.setItem("paws-tierlist-v2", JSON.stringify({
                selectedGame,
                allTeams,
                tiers,
                unrankedTeams,
            }));
        }, 500);
        return () => clearTimeout(timer);
    }, [tiers, unrankedTeams, selectedGame, allTeams, loading]);

    function handleSetupComplete(game: VideoGameSlug, teams: Team[]) {
        setSelectedGame(game);
        setAllTeams(teams);
        setUnrankedTeams(teams);
        setTiers({
            S: { ...DEFAULT_TIERS.S, teams: [] },
            A: { ...DEFAULT_TIERS.A, teams: [] },
            B: { ...DEFAULT_TIERS.B, teams: [] },
            C: { ...DEFAULT_TIERS.C, teams: [] },
            D: { ...DEFAULT_TIERS.D, teams: [] },
            F: { ...DEFAULT_TIERS.F, teams: [] },
        });
        setSetupOpen(false);
    }

    function handleDragStart(event: DragStartEvent) {
        setActiveTeam(event.active.data.current?.team || null);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveTeam(null);
        const { active, over } = event;
        if (!over) return;

        const { team, tierId: sourceTierId } = active.data.current as { team: Team; tierId: string };
        const targetTierId = over.data.current?.tierId as string;

        if (!targetTierId || sourceTierId === targetTierId) return;

        // Remove from source
        if (sourceTierId === "unranked") {
            setUnrankedTeams(prev => prev.filter(t => t.id !== team.id));
        } else {
            setTiers(prev => ({
                ...prev,
                [sourceTierId]: {
                    ...prev[sourceTierId],
                    teams: prev[sourceTierId].teams.filter(t => t.id !== team.id),
                },
            }));
        }

        // Add to target
        if (targetTierId === "unranked") {
            setUnrankedTeams(prev => [...prev, team]);
        } else {
            setTiers(prev => ({
                ...prev,
                [targetTierId]: {
                    ...prev[targetTierId],
                    teams: [...prev[targetTierId].teams, team],
                },
            }));
        }
    }

    function removeTeamFromTier(tierId: string, teamId: number) {
        const team = tiers[tierId].teams.find(t => t.id === teamId);
        if (!team) return;

        setTiers(prev => ({
            ...prev,
            [tierId]: {
                ...prev[tierId],
                teams: prev[tierId].teams.filter(t => t.id !== teamId),
            },
        }));
        setUnrankedTeams(prev => [...prev, team]);
    }

    function resetAll() {
        localStorage.removeItem("paws-tierlist-v2");
        setSelectedGame(null);
        setAllTeams([]);
        setTiers({
            S: { ...DEFAULT_TIERS.S, teams: [] },
            A: { ...DEFAULT_TIERS.A, teams: [] },
            B: { ...DEFAULT_TIERS.B, teams: [] },
            C: { ...DEFAULT_TIERS.C, teams: [] },
            D: { ...DEFAULT_TIERS.D, teams: [] },
            F: { ...DEFAULT_TIERS.F, teams: [] },
        });
        setUnrankedTeams([]);
        setSetupOpen(true);
    }

    function handleAddTeams(newTeams: Team[]) {
        setAllTeams(prev => [...prev, ...newTeams]);
        setUnrankedTeams(prev => [...prev, ...newTeams]);
    }

    const existingTeamIds = useMemo(() => new Set(allTeams.map(t => t.id)), [allTeams]);

    async function exportAsImage() {
        if (!tierListRef.current) return;

        try {
            const dataUrl = await domToPng(tierListRef.current, {
                scale: 2,
                backgroundColor: '#09090b',
            });

            const link = document.createElement('a');
            link.download = `tierlist-${selectedGame}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Error exporting image.');
        }
    }

    const rankedCount = useMemo(() =>
        Object.values(tiers).reduce((acc, tier) => acc + tier.teams.length, 0),
        [tiers]
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary animate-pulse">
                <RotateCcw className="w-10 h-10 mb-4 animate-spin" />
                <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
            </div>
        );
    }

    return (
        <>
            <SetupModal
                isOpen={setupOpen}
                canClose={allTeams.length > 0}
                onComplete={handleSetupComplete}
                onClose={() => setSetupOpen(false)}
            />

            {selectedGame && (
                <AddTeamsModal
                    isOpen={addTeamsOpen}
                    onClose={() => setAddTeamsOpen(false)}
                    onAdd={handleAddTeams}
                    selectedGame={selectedGame}
                    existingTeamIds={existingTeamIds}
                />            
            )}

            <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
                <div className="container-custom py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-2">
                            <span className="text-primary">Tier</span> List
                        </h1>
                        {selectedGame && (
                            <p className="text-muted-foreground">
                                Ranking {VIDEO_GAMES[selectedGame]?.name} teams
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                        {allTeams.length > 0 && (
                            <button
                                onClick={() => setAddTeamsOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Teams</span>
                            </button>
                        )}

                        <button
                            onClick={() => setSetupOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-card border border-card-border rounded-lg hover:border-primary/50 transition-colors"
                        >
                            <Settings className="w-4 h-4 text-primary" />
                            <span className="font-medium">Change Teams</span>
                        </button>

                        <button
                            onClick={resetAll}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>

                        <button
                            onClick={exportAsImage}
                            disabled={rankedCount === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-card border border-card-border rounded-lg hover:border-primary/50 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>


                    {allTeams.length === 0 ? (
                        <div className="text-center py-20">
                            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h2 className="text-xl font-display font-bold mb-2">No Teams Selected</h2>
                            <p className="text-muted-foreground mb-6">Select teams to start creating your tier list</p>
                            <button
                                onClick={() => setSetupOpen(true)}
                                className="px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-lg transition-colors"
                            >
                                Select Teams
                            </button>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="grid lg:grid-cols-[1fr_300px] gap-6">
                                {/* Tier List */}
                                <div ref={tierListRef} className="space-y-2 bg-background p-4 rounded-xl">
                                    {Object.entries(tiers).map(([tierId, tier]) => (
                                        <TierRow
                                            key={tierId}
                                            tierId={tierId}
                                            tier={tier}
                                            onRemoveTeam={(teamId) => removeTeamFromTier(tierId, teamId)}
                                        />
                                    ))}
                                </div>

                                {/* Unranked Pool */}
                                <div className="lg:sticky lg:top-24 lg:self-start">
                                    <UnrankedPool teams={unrankedTeams} />
                                </div>
                            </div>

                            <DragOverlay>
                                {activeTeam && (
                                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background border border-primary shadow-xl">
                                        <div className="w-12 h-12 rounded-lg bg-secondary border border-card-border overflow-hidden flex items-center justify-center relative">
                                            {activeTeam.image_url ? (
                                                <Image src={activeTeam.image_url} alt={activeTeam.name} fill className="object-contain p-1" sizes="48px" />
                                            ) : (
                                                <span className="text-xs font-bold text-muted-foreground">{activeTeam.acronym || activeTeam.name.slice(0, 3)}</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground text-center">
                                            {activeTeam.acronym || activeTeam.name.slice(0, 6)}
                                        </span>
                                    </div>
                                )}
                            </DragOverlay>
                        </DndContext>
                    )}

                    {/* Stats */}
                    {allTeams.length > 0 && (
                        <div className="mt-8 text-center text-sm text-muted-foreground">
                            <Trophy className="w-4 h-4 inline mr-2" />
                            {rankedCount} of {allTeams.length} teams ranked
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
