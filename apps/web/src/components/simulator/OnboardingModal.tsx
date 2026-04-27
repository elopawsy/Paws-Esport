"use client";

import { useState, useEffect } from "react";
import { VIDEO_GAMES, VideoGameSlug } from "@/infrastructure/pandascore/constants";
import { Team } from "@/types";
import { Search, CheckCircle2, Trophy, ArrowRight, Loader2, Gamepad2, ChevronLeft } from "lucide-react";
import Image from "next/image";

interface Props {
    isOpen: boolean;
    onComplete: (game: VideoGameSlug, teams: Team[]) => void;
    onClose: () => void; // For closing without completing (if needed, though usually forced on empty)
    canClose: boolean;
}

const STEPS = {
    GAME_SELECTION: 0,
    TEAM_SELECTION: 1,
};

export default function OnboardingModal({ isOpen, onComplete, onClose, canClose }: Props) {
    const [step, setStep] = useState(STEPS.GAME_SELECTION);
    const [selectedGame, setSelectedGame] = useState<VideoGameSlug | null>(null);
    const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

    // Team selection state
    const [activeTab, setActiveTab] = useState<"top" | "search">("top");
    const [topTeams, setTopTeams] = useState<Team[]>([]);
    const [loadingTop, setLoadingTop] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Team[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load top teams when game changes to team selection
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

    // Search teams
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
    }

    const handleFinish = () => {
        if (selectedGame) {
            onComplete(selectedGame, selectedTeams);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-card-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
                {/* Background decorative elements */}
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
                            <Gamepad2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-foreground">Setup Simulator</h2>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                {step === STEPS.GAME_SELECTION ? "Select a Game" : "Select Starting Teams"}
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

                    {/* STEP 1: GAME SELECTION */}
                    {step === STEPS.GAME_SELECTION && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.values(VIDEO_GAMES).map((game) => (
                                <button
                                    key={game.slug}
                                    onClick={() => handleGameSelect(game.slug)}
                                    className="group relative flex flex-col items-center gap-4 p-6 bg-secondary/30 hover:bg-secondary border border-card-border hover:border-primary/50 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 text-center"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-background to-secondary shadow-inner flex items-center justify-center border border-card-border group-hover:border-primary/30 group-hover:scale-110 transition-all duration-500">
                                        {/* Placeholder icon based on game slug - could be images later */}
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

                    {/* STEP 2: TEAM SELECTION */}
                    {step === STEPS.TEAM_SELECTION && (
                        <div className="flex flex-col h-full gap-6">
                            {/* Tabs & Search */}
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

                            {/* Team Grid */}
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
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                            Start Simulator <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
