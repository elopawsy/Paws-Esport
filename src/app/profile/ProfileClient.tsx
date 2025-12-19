"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { User, Coins, Heart, Users, Search, Check, X, Loader2, UserPlus, Camera, Trash2 } from "lucide-react";
import { BetHistory } from "@/components/betting";

interface Team {
    id: number;
    name: string;
    acronym: string | null;
    imageUrl: string | null;
}

interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    coins: number;
    favoriteTeam: Team | null;
}

interface Friend {
    friendshipId: string;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        coins: number;
    };
}

interface ProfileClientProps {
    user: UserProfile;
    teams: Team[];
    friends: Friend[];
    pendingRequests: Friend[];
}

export default function ProfileClient({ user, teams, friends, pendingRequests }: ProfileClientProps) {
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(user.favoriteTeam);
    const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
    const [teamSearch, setTeamSearch] = useState("");
    const [showTeamDropdown, setShowTeamDropdown] = useState(false);

    const [friendUsername, setFriendUsername] = useState("");
    const [isAddingFriend, setIsAddingFriend] = useState(false);
    const [friendError, setFriendError] = useState<string | null>(null);
    const [friendSuccess, setFriendSuccess] = useState<string | null>(null);

    const [currentPendingRequests, setCurrentPendingRequests] = useState(pendingRequests);
    const [currentFriends, setCurrentFriends] = useState(friends);
    const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

    // Avatar state
    const [currentImage, setCurrentImage] = useState<string | null>(user.image);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const displayName = user.name || user.email.split("@")[0];

    // Dynamic team search state
    const [searchedTeams, setSearchedTeams] = useState<Team[]>(teams);
    const [isSearchingTeams, setIsSearchingTeams] = useState(false);

    // Debounced team search from PandaScore API
    const searchTeams = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSearchedTeams(teams);
            return;
        }

        setIsSearchingTeams(true);
        try {
            const res = await fetch(`/api/teams/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                // Transform API response to match Team interface
                const apiTeams = (Array.isArray(data) ? data : data.teams || []).map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    acronym: t.acronym,
                    imageUrl: t.image_url || t.imageUrl,
                }));
                setSearchedTeams(apiTeams);
            }
        } catch (error) {
            console.error("Error searching teams:", error);
        } finally {
            setIsSearchingTeams(false);
        }
    }, [teams]);

    // Debounce team search
    useEffect(() => {
        const timeout = setTimeout(() => {
            searchTeams(teamSearch);
        }, 300);
        return () => clearTimeout(timeout);
    }, [teamSearch, searchTeams]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarError(null);
        setIsUploadingAvatar(true);

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const res = await fetch("/api/user/avatar", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setAvatarError(data.error || "Erreur lors de l'upload");
            } else {
                setCurrentImage(data.imageUrl);
            }
        } catch {
            setAvatarError("Erreur lors de l'upload");
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveAvatar = async () => {
        setAvatarError(null);
        setIsUploadingAvatar(true);

        try {
            const res = await fetch("/api/user/avatar", {
                method: "DELETE",
            });

            if (res.ok) {
                setCurrentImage(null);
            }
        } catch {
            setAvatarError("Erreur lors de la suppression");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSelectTeam = async (team: Team) => {
        setIsUpdatingTeam(true);
        setShowTeamDropdown(false);

        try {
            const res = await fetch("/api/user/favorite-team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamId: team.id,
                    teamName: team.name,
                    teamAcronym: team.acronym,
                    teamImageUrl: team.imageUrl,
                }),
            });

            if (res.ok) {
                setSelectedTeam(team);
            } else {
                const data = await res.json();
                console.error("Error updating favorite team:", data.error);
            }
        } catch (error) {
            console.error("Error updating favorite team:", error);
        } finally {
            setIsUpdatingTeam(false);
        }
    };

    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault();
        setFriendError(null);
        setFriendSuccess(null);
        setIsAddingFriend(true);

        try {
            const res = await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: friendUsername }),
            });

            const data = await res.json();

            if (!res.ok) {
                setFriendError(data.error || "Une erreur est survenue");
            } else {
                setFriendSuccess("Demande d'ami envoyée !");
                setFriendUsername("");
            }
        } catch {
            setFriendError("Une erreur est survenue");
        } finally {
            setIsAddingFriend(false);
        }
    };

    const handleFriendRequest = async (friendshipId: string, action: "accept" | "reject") => {
        setProcessingRequestId(friendshipId);

        try {
            const res = await fetch(`/api/friends/${friendshipId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                const request = currentPendingRequests.find((r) => r.friendshipId === friendshipId);
                setCurrentPendingRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId));

                if (action === "accept" && request) {
                    setCurrentFriends((prev) => [...prev, request]);
                }
            }
        } catch (error) {
            console.error("Error processing friend request:", error);
        } finally {
            setProcessingRequestId(null);
        }
    };

    return (
        <div className="container-custom py-8">
            <h1 className="text-3xl font-display font-bold mb-8">Mon Profil</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* User Info Card */}
                <div className="bg-card border border-card-border rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-6">
                        {/* Avatar with upload */}
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-card-border">
                                {currentImage ? (
                                    <img src={currentImage} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-primary" />
                                )}
                            </div>

                            {/* Upload overlay */}
                            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="p-1.5 bg-primary/80 hover:bg-primary text-white rounded-full transition-colors"
                                    title="Changer la photo"
                                >
                                    {isUploadingAvatar ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Camera className="w-4 h-4" />
                                    )}
                                </button>
                                {currentImage && (
                                    <button
                                        onClick={handleRemoveAvatar}
                                        disabled={isUploadingAvatar}
                                        className="p-1.5 bg-destructive/80 hover:bg-destructive text-white rounded-full transition-colors"
                                        title="Supprimer la photo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">{displayName}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            {avatarError && (
                                <p className="text-xs text-destructive mt-1">{avatarError}</p>
                            )}
                        </div>
                    </div>

                    {/* Coins Display */}
                    <div className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-lg mb-6">
                        <Coins className="w-8 h-8 text-yellow-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Solde</p>
                            <p className="text-2xl font-bold text-yellow-500">{user.coins.toLocaleString()} coins</p>
                        </div>
                    </div>
                </div>

                {/* Favorite Team Card */}
                <div id="favorite-team" className="bg-card border border-card-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Heart className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold">Équipe Favorite</h3>
                    </div>

                    {selectedTeam ? (
                        <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg mb-4">
                            {selectedTeam.imageUrl ? (
                                <img
                                    src={selectedTeam.imageUrl}
                                    alt={selectedTeam.name}
                                    className="w-12 h-12 object-contain"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-card-border rounded-lg flex items-center justify-center text-lg font-bold">
                                    {selectedTeam.acronym || selectedTeam.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="font-bold">{selectedTeam.name}</p>
                                {selectedTeam.acronym && (
                                    <p className="text-sm text-muted-foreground">{selectedTeam.acronym}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground mb-4">Aucune équipe sélectionnée</p>
                    )}

                    {/* Team Selector */}
                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={teamSearch}
                                onChange={(e) => setTeamSearch(e.target.value)}
                                onFocus={() => setShowTeamDropdown(true)}
                                placeholder="Rechercher une équipe..."
                                className="w-full pl-10 pr-4 py-2 bg-background border border-card-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        {showTeamDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-card border border-card-border rounded-lg shadow-xl z-10">
                                {isSearchingTeams ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    </div>
                                ) : searchedTeams.length === 0 ? (
                                    <p className="px-4 py-3 text-muted-foreground text-sm">
                                        {teamSearch.length >= 2 ? "Aucune équipe trouvée" : "Tape au moins 2 caractères..."}
                                    </p>
                                ) : (
                                    searchedTeams.map((team: Team) => (
                                        <button
                                            key={team.id}
                                            onClick={() => handleSelectTeam(team)}
                                            disabled={isUpdatingTeam}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary/10 transition-colors disabled:opacity-50"
                                        >
                                            {team.imageUrl ? (
                                                <img src={team.imageUrl} alt={team.name} className="w-8 h-8 object-contain" />
                                            ) : (
                                                <div className="w-8 h-8 bg-card-border rounded flex items-center justify-center text-xs font-bold">
                                                    {team.acronym || team.name.charAt(0)}
                                                </div>
                                            )}
                                            <span className="font-medium">{team.name}</span>
                                            {selectedTeam?.id === team.id && <Check className="w-4 h-4 text-primary ml-auto" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Friends Card */}
                <div id="friends" className="bg-card border border-card-border rounded-lg p-6 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold">Mes Amis</h3>
                    </div>

                    {/* Add Friend Form */}
                    <form onSubmit={handleAddFriend} className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={friendUsername}
                                onChange={(e) => setFriendUsername(e.target.value)}
                                placeholder="Pseudo du joueur à ajouter..."
                                className="w-full pl-10 pr-4 py-2 bg-background border border-card-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAddingFriend || !friendUsername.trim()}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-md transition-colors disabled:opacity-50"
                        >
                            {isAddingFriend ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
                        </button>
                    </form>

                    {friendError && (
                        <div className="mb-4 px-4 py-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                            {friendError}
                        </div>
                    )}
                    {friendSuccess && (
                        <div className="mb-4 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-sm rounded-md">
                            {friendSuccess}
                        </div>
                    )}

                    {/* Pending Requests */}
                    {currentPendingRequests.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-medium text-sm text-muted-foreground mb-3">
                                Demandes en attente ({currentPendingRequests.length})
                            </h4>
                            <div className="space-y-2">
                                {currentPendingRequests.map(({ friendshipId, user: friend }) => (
                                    <div
                                        key={friendshipId}
                                        className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                {friend.image ? (
                                                    <img src={friend.image} alt={friend.name || ""} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{friend.name || friend.email.split("@")[0]}</p>
                                                <p className="text-sm text-muted-foreground">{friend.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleFriendRequest(friendshipId, "accept")}
                                                disabled={processingRequestId === friendshipId}
                                                className="p-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleFriendRequest(friendshipId, "reject")}
                                                disabled={processingRequestId === friendshipId}
                                                className="p-2 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-md transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Friends List */}
                    {currentFriends.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Tu n&apos;as pas encore d&apos;amis. Ajoute quelqu&apos;un avec son email !
                        </p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {currentFriends.map(({ friendshipId, user: friend }) => (
                                <div
                                    key={friendshipId}
                                    className="flex items-center gap-3 p-3 bg-background border border-card-border rounded-lg"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        {friend.image ? (
                                            <img src={friend.image} alt={friend.name || ""} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{friend.name || friend.email.split("@")[0]}</p>
                                        <div className="flex items-center gap-1 text-sm text-yellow-500">
                                            <Coins className="w-3 h-3" />
                                            <span>{friend.coins.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bet History */}
                <BetHistory />
            </div>
        </div>
    );
}

