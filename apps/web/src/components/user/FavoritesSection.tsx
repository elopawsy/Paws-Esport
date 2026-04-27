"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Users, Search, Plus, X, Loader2, Star } from "lucide-react";
import Image from "next/image";

interface TrackedTeam {
    id: string;
    teamId: number;
    team: {
        id: number;
        name: string;
        acronym: string | null;
        imageUrl: string | null;
    };
}

interface FavoritePlayer {
    id: string;
    playerId: number;
    playerName: string;
    playerSlug: string;
    playerImage: string | null;
    teamName: string | null;
}

interface SearchTeam {
    id: number;
    name: string;
    acronym: string | null;
    image_url: string | null;
}

interface SearchPlayer {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
    current_team: {
        name: string;
    } | null;
}

export default function FavoritesSection() {
    // Tracked Teams state
    const [trackedTeams, setTrackedTeams] = useState<TrackedTeam[]>([]);
    const [isLoadingTeams, setIsLoadingTeams] = useState(true);
    const [teamSearch, setTeamSearch] = useState("");
    const [teamSearchResults, setTeamSearchResults] = useState<SearchTeam[]>([]);
    const [isSearchingTeams, setIsSearchingTeams] = useState(false);
    const [showTeamSearch, setShowTeamSearch] = useState(false);

    // Favorite Players state
    const [favoritePlayers, setFavoritePlayers] = useState<FavoritePlayer[]>([]);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
    const [playerSearch, setPlayerSearch] = useState("");
    const [playerSearchResults, setPlayerSearchResults] = useState<SearchPlayer[]>([]);
    const [isSearchingPlayers, setIsSearchingPlayers] = useState(false);
    const [showPlayerSearch, setShowPlayerSearch] = useState(false);

    // Fetch tracked teams
    useEffect(() => {
        async function fetchTrackedTeams() {
            try {
                const res = await fetch("/api/user/tracked-teams");
                if (res.ok) {
                    const data = await res.json();
                    setTrackedTeams(data);
                }
            } catch (error) {
                console.error("Error fetching tracked teams:", error);
            } finally {
                setIsLoadingTeams(false);
            }
        }
        fetchTrackedTeams();
    }, []);

    // Fetch favorite players
    useEffect(() => {
        async function fetchFavoritePlayers() {
            try {
                const res = await fetch("/api/user/favorite-players");
                if (res.ok) {
                    const data = await res.json();
                    setFavoritePlayers(data);
                }
            } catch (error) {
                console.error("Error fetching favorite players:", error);
            } finally {
                setIsLoadingPlayers(false);
            }
        }
        fetchFavoritePlayers();
    }, []);

    // Search teams
    const searchTeams = useCallback(async (query: string) => {
        if (query.length < 2) {
            setTeamSearchResults([]);
            return;
        }
        setIsSearchingTeams(true);
        try {
            const res = await fetch(`/api/teams/search?q=${encodeURIComponent(query)}&game=cs-2`);
            if (res.ok) {
                const data = await res.json();
                setTeamSearchResults(data.slice(0, 10));
            }
        } catch (error) {
            console.error("Error searching teams:", error);
        } finally {
            setIsSearchingTeams(false);
        }
    }, []);

    // Search players
    const searchPlayers = useCallback(async (query: string) => {
        if (query.length < 2) {
            setPlayerSearchResults([]);
            return;
        }
        setIsSearchingPlayers(true);
        try {
            const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}&game=cs-2`);
            if (res.ok) {
                const data = await res.json();
                setPlayerSearchResults(data.slice(0, 10));
            }
        } catch (error) {
            console.error("Error searching players:", error);
        } finally {
            setIsSearchingPlayers(false);
        }
    }, []);

    // Debounced team search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (teamSearch) searchTeams(teamSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [teamSearch, searchTeams]);

    // Debounced player search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (playerSearch) searchPlayers(playerSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [playerSearch, searchPlayers]);

    // Add tracked team
    const handleAddTeam = async (team: SearchTeam) => {
        try {
            const res = await fetch("/api/user/tracked-teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamId: team.id,
                    teamName: team.name,
                    teamAcronym: team.acronym,
                    teamImageUrl: team.image_url,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setTrackedTeams((prev) => [data, ...prev]);
                setTeamSearch("");
                setTeamSearchResults([]);
                setShowTeamSearch(false);
            }
        } catch (error) {
            console.error("Error adding team:", error);
        }
    };

    // Remove tracked team
    const handleRemoveTeam = async (teamId: number) => {
        try {
            const res = await fetch(`/api/user/tracked-teams?teamId=${teamId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setTrackedTeams((prev) => prev.filter((t) => t.teamId !== teamId));
            }
        } catch (error) {
            console.error("Error removing team:", error);
        }
    };

    // Add favorite player
    const handleAddPlayer = async (player: SearchPlayer) => {
        try {
            const res = await fetch("/api/user/favorite-players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerId: player.id,
                    playerSlug: player.slug,
                    playerName: player.name,
                    playerImage: player.image_url,
                    teamName: player.current_team?.name,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setFavoritePlayers((prev) => [data, ...prev]);
                setPlayerSearch("");
                setPlayerSearchResults([]);
                setShowPlayerSearch(false);
            }
        } catch (error) {
            console.error("Error adding player:", error);
        }
    };

    // Remove favorite player
    const handleRemovePlayer = async (playerId: number) => {
        try {
            const res = await fetch(`/api/user/favorite-players?playerId=${playerId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setFavoritePlayers((prev) => prev.filter((p) => p.playerId !== playerId));
            }
        } catch (error) {
            console.error("Error removing player:", error);
        }
    };

    return (
        <div className="bg-card border border-card-border rounded-lg p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Favorites</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Tracked Teams */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            Tracked Teams
                        </h4>
                        <button
                            onClick={() => setShowTeamSearch(!showTeamSearch)}
                            className="p-1.5 hover:bg-card-border rounded-md transition-colors text-primary"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Team Search */}
                    {showTeamSearch && (
                        <div className="mb-4 relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={teamSearch}
                                    onChange={(e) => setTeamSearch(e.target.value)}
                                    placeholder="Search teams..."
                                    className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                {isSearchingTeams && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                                )}
                            </div>
                            {teamSearchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-card border border-card-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {teamSearchResults.map((team) => (
                                        <button
                                            key={team.id}
                                            onClick={() => handleAddTeam(team)}
                                            disabled={trackedTeams.some((t) => t.teamId === team.id)}
                                            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-card-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {team.image_url ? (
                                                <Image src={team.image_url} alt={team.name} width={24} height={24} className="rounded" />
                                            ) : (
                                                <div className="w-6 h-6 bg-card-border rounded flex items-center justify-center text-xs">
                                                    {team.acronym?.[0] || team.name[0]}
                                                </div>
                                            )}
                                            <span className="text-sm">{team.name}</span>
                                            {trackedTeams.some((t) => t.teamId === team.id) && (
                                                <span className="ml-auto text-xs text-primary">Following</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tracked Teams List */}
                    {isLoadingTeams ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : trackedTeams.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No teams tracked yet
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {trackedTeams.map((tracked) => (
                                <div
                                    key={tracked.id}
                                    className="flex items-center gap-3 p-2 bg-background rounded-md group"
                                >
                                    {tracked.team.imageUrl ? (
                                        <Image
                                            src={tracked.team.imageUrl}
                                            alt={tracked.team.name}
                                            width={28}
                                            height={28}
                                            className="rounded"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 bg-card-border rounded flex items-center justify-center text-xs">
                                            {tracked.team.acronym?.[0] || tracked.team.name[0]}
                                        </div>
                                    )}
                                    <span className="text-sm flex-1">{tracked.team.name}</span>
                                    <button
                                        onClick={() => handleRemoveTeam(tracked.teamId)}
                                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                                    >
                                        <X className="w-4 h-4 text-destructive" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Favorite Players */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium flex items-center gap-2">
                            <Star className="w-4 h-4 text-muted-foreground" />
                            Favorite Players
                        </h4>
                        <button
                            onClick={() => setShowPlayerSearch(!showPlayerSearch)}
                            className="p-1.5 hover:bg-card-border rounded-md transition-colors text-primary"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Player Search */}
                    {showPlayerSearch && (
                        <div className="mb-4 relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={playerSearch}
                                    onChange={(e) => setPlayerSearch(e.target.value)}
                                    placeholder="Search players..."
                                    className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                {isSearchingPlayers && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                                )}
                            </div>
                            {playerSearchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-card border border-card-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {playerSearchResults.map((player) => (
                                        <button
                                            key={player.id}
                                            onClick={() => handleAddPlayer(player)}
                                            disabled={favoritePlayers.some((p) => p.playerId === player.id)}
                                            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-card-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {player.image_url ? (
                                                <Image src={player.image_url} alt={player.name} width={24} height={24} className="rounded-full" />
                                            ) : (
                                                <div className="w-6 h-6 bg-card-border rounded-full flex items-center justify-center text-xs">
                                                    {player.name[0]}
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <span className="text-sm block">{player.name}</span>
                                                {player.current_team && (
                                                    <span className="text-xs text-muted-foreground">{player.current_team.name}</span>
                                                )}
                                            </div>
                                            {favoritePlayers.some((p) => p.playerId === player.id) && (
                                                <span className="ml-auto text-xs text-primary">Favorite</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Favorite Players List */}
                    {isLoadingPlayers ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : favoritePlayers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No favorite players yet
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {favoritePlayers.map((player) => (
                                <div
                                    key={player.id}
                                    className="flex items-center gap-3 p-2 bg-background rounded-md group"
                                >
                                    {player.playerImage ? (
                                        <Image
                                            src={player.playerImage}
                                            alt={player.playerName}
                                            width={28}
                                            height={28}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 bg-card-border rounded-full flex items-center justify-center text-xs">
                                            {player.playerName[0]}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <span className="text-sm block">{player.playerName}</span>
                                        {player.teamName && (
                                            <span className="text-xs text-muted-foreground">{player.teamName}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemovePlayer(player.playerId)}
                                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                                    >
                                        <X className="w-4 h-4 text-destructive" />
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
