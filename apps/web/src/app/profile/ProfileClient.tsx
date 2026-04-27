"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { User, Coins, Heart, Users, Search, Check, X, Loader2, UserPlus, Camera, Trash2, Mail, AlertTriangle, Settings, Trophy, History, LayoutDashboard, LogOut, Lock, Download, Database, Eye, EyeOff } from "lucide-react";
import { BetHistory } from "@/components/betting";
import FavoritesSection from "@/components/user/FavoritesSection";
import { sendVerificationEmail, signOut, authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { Team } from "@/types";

interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
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
    const [activeTab, setActiveTab] = useState<"overview" | "friends" | "activity" | "settings">("overview");

    // -- State from previous version --
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(user.favoriteTeam);
    const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
    const [teamSearch, setTeamSearch] = useState("");
    const [showTeamDropdown, setShowTeamDropdown] = useState(false);
    const [searchedTeams, setSearchedTeams] = useState<Team[]>(teams);
    const [isSearchingTeams, setIsSearchingTeams] = useState(false);

    const [friendUsername, setFriendUsername] = useState("");
    const [isAddingFriend, setIsAddingFriend] = useState(false);
    const [friendError, setFriendError] = useState<string | null>(null);
    const [friendSuccess, setFriendSuccess] = useState<string | null>(null);
    const [currentPendingRequests, setCurrentPendingRequests] = useState(pendingRequests);
    const [currentFriends, setCurrentFriends] = useState(friends);
    const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

    const [currentImage, setCurrentImage] = useState<string | null>(user.image);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSendingVerification, setIsSendingVerification] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const displayName = user.name || user.email.split("@")[0];

    // -- Settings State --
    const [activeSettingsSection, setActiveSettingsSection] = useState<"profile" | "security" | "data">("profile");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [newName, setNewName] = useState(user.name || "");
    const [isChangingName, setIsChangingName] = useState(false);
    const [nameSuccess, setNameSuccess] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


    // -- Logic (Same as before) --
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
                const apiTeams = (Array.isArray(data) ? data : data.teams || []).map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    acronym: t.acronym,
                    image_url: t.image_url || t.imageUrl,
                    dark_image_url: t.dark_image_url
                }));
                // We use type assertion since dynamic fetch might map differently
                setSearchedTeams(apiTeams as unknown as Team[]);
            }
        } catch (error) {
            console.error("Error searching teams:", error);
        } finally {
            setIsSearchingTeams(false);
        }
    }, [teams]);

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
            const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) setAvatarError(data.error || "Upload error");
            else setCurrentImage(data.imageUrl);
        } catch {
            setAvatarError("Upload error");
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveAvatar = async () => {
        setAvatarError(null);
        setIsUploadingAvatar(true);
        try {
            const res = await fetch("/api/user/avatar", { method: "DELETE" });
            if (res.ok) setCurrentImage(null);
        } catch {
            setAvatarError("Deletion error");
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
                    teamImageUrl: team.image_url,
                }),
            });
            if (res.ok) setSelectedTeam(team);
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
            if (!res.ok) setFriendError(data.error || "An error occurred");
            else {
                setFriendSuccess("Friend request sent!");
                setFriendUsername("");
            }
        } catch {
            setFriendError("An error occurred");
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

    const handleResendVerification = async () => {
        setIsSendingVerification(true);
        try {
            await sendVerificationEmail({ email: user.email });
            setVerificationSent(true);
        } catch (error) {
            console.error("Error sending verification email:", error);
        } finally {
            setIsSendingVerification(false);
        }
    };

    // -- Settings Logic --
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters.");
            return;
        }

        setIsChangingPassword(true);
        try {
            const result = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
            });
            if (result.error) {
                setPasswordError(result.error.message || "Failed to change password.");
            } else {
                setPasswordSuccess(true);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch {
            setPasswordError("An error occurred.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleChangeName = async (e: React.FormEvent) => {
        e.preventDefault();
        setNameSuccess(false);
        setIsChangingName(true);
        try {
            const result = await authClient.updateUser({ name: newName });
            if (result.error) console.error("Error updating name:", result.error);
            else {
                setNameSuccess(true);
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            console.error("Error updating name:", error);
        } finally {
            setIsChangingName(false);
        }
    };

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            const res = await fetch("/api/user/export");
            if (!res.ok) throw new Error("Failed to export data");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "my-data-export.json";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export error:", error);
            alert("An error occurred while exporting your data.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch("/api/user/delete", { method: "DELETE" });
            if (res.ok) window.location.href = "/";
            else {
                const data = await res.json();
                alert(data.error || "Failed to delete account");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting your account.");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Helper to get logic
    const getTeamLogo = (team: Team) => team.dark_image_url || team.image_url;

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Banner Area */}
            <div className="relative bg-card border-b border-card-border">
                <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/5 to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                </div>

                <div className="container-custom relative px-4 sm:px-6 lg:px-8 -mt-20 pb-8">
                    <div className="flex flex-col md:flex-row items-end gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full bg-secondary border-4 border-background shadow-xl overflow-hidden flex items-center justify-center">
                                {currentImage ? (
                                    <Image src={currentImage} alt={displayName} width={160} height={160} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-muted-foreground" />
                                )}
                            </div>
                            {/* Upload Overlay */}
                            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-pointer z-10">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 bg-primary text-primary-foreground rounded-full hover:scale-110 transition-transform"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                {currentImage && (
                                    <button
                                        onClick={handleRemoveAvatar}
                                        className="p-2 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform"
                                    >
                                        <Trash2 className="w-5 h-5" />
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

                        {/* Info */}
                        <div className="flex-1 mb-2">
                            <h1 className="text-4xl font-display font-bold text-foreground">{displayName}</h1>
                            <p className="text-muted-foreground">{user.email}</p>
                            {!user.emailVerified && (
                                <button
                                    onClick={handleResendVerification}
                                    disabled={isSendingVerification || verificationSent}
                                    className="mt-2 text-xs flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                                >
                                    <AlertTriangle className="w-3 h-3" />
                                    {verificationSent ? "Sent!" : "Verify Email"}
                                </button>
                            )}
                        </div>

                        {/* Stats / Actions */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex flex-col items-end">
                                <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Balance</span>
                                <div className="flex items-center gap-2 text-2xl font-bold text-yellow-500">
                                    <Coins className="w-6 h-6" />
                                    {user.coins.toLocaleString()}
                                </div>
                            </div>
                            <div className="h-10 w-px bg-border mx-2" />
                            <div className="flex flex-col items-end">
                                <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Friends</span>
                                <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                    <Users className="w-6 h-6 text-primary" />
                                    {currentFriends.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="container-custom flex items-center gap-8 border-t border-card-border/50 overflow-x-auto scrollbar-hide">
                    {[
                        { id: "overview", label: "Overview", icon: LayoutDashboard },
                        { id: "friends", label: "Friends", icon: Users },
                        { id: "activity", label: "Betting History", icon: History },
                        { id: "settings", label: "Settings", icon: Settings },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.id === "friends" && currentPendingRequests.length > 0 && (
                                    <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                                        {currentPendingRequests.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="container-custom py-8">

                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Favorite Team Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm overflow-visible">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-primary" />
                                        <h3 className="text-lg font-bold font-display">Favorite Team</h3>
                                    </div>
                                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                                        Display on profile
                                    </span>
                                </div>

                                {selectedTeam ? (
                                    <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-secondary/50 to-transparent rounded-xl border border-card-border relative group">
                                        <div className="w-20 h-20 bg-background rounded-xl p-2 flex items-center justify-center border border-card-border shadow-sm">
                                            {getTeamLogo(selectedTeam) ? (
                                                <Image src={getTeamLogo(selectedTeam)!} alt={selectedTeam.name} width={64} height={64} className="object-contain" />
                                            ) : (
                                                <span className="text-2xl font-bold text-muted-foreground">{selectedTeam.acronym}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold mb-1">{selectedTeam.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground bg-background px-2 py-0.5 rounded border border-card-border">{selectedTeam.acronym}</span>
                                                <span className="text-xs text-primary flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Following
                                                </span>
                                            </div>
                                        </div>
                                        {/* Change Button */}
                                        <button
                                            onClick={() => { setSelectedTeam(null); setTeamSearch(""); }}
                                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="relative z-20">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={teamSearch}
                                                onChange={(e) => setTeamSearch(e.target.value)}
                                                onFocus={() => setShowTeamDropdown(true)}
                                                placeholder="Search for your favorite team..."
                                                className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-card-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                        {showTeamDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-card border border-card-border rounded-xl shadow-xl z-30 animate-in fade-in zoom-in-95 duration-200">
                                                {isSearchingTeams ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                    </div>
                                                ) : searchedTeams.length > 0 ? (
                                                    searchedTeams.map((team) => (
                                                        <button
                                                            key={team.id}
                                                            onClick={() => handleSelectTeam(team)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left border-b border-card-border/50 last:border-0"
                                                        >
                                                            {getTeamLogo(team) ? (
                                                                <Image src={getTeamLogo(team)!} alt={team.name} width={32} height={32} className="object-contain" />
                                                            ) : (
                                                                <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-xs font-bold">{team.acronym}</div>
                                                            )}
                                                            <span className="font-medium text-sm">{team.name}</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">No teams found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Favorites Component */}
                            <FavoritesSection />
                        </div>

                        {/* Recent Activity / Quick Stats Side */}
                        <div className="space-y-6">
                            <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold font-display mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                        <span className="text-sm text-muted-foreground">Account Status</span>
                                        <span className="text-sm font-bold text-green-500 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Active
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                        <span className="text-sm text-muted-foreground">Member Since</span>
                                        <span className="text-sm font-bold">Dec 2025</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FRIENDS TAB */}
                {activeTab === "friends" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Friend List */}
                            <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <Users className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-bold font-display">My Friends ({currentFriends.length})</h3>
                                </div>
                                {currentFriends.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {currentFriends.map(({ friendshipId, user: friend }) => (
                                            <Link href={`/u/${friend.id}`} key={friendshipId} className="flex items-center gap-4 p-4 bg-background border border-card-border rounded-xl hover:border-primary/30 transition-colors cursor-pointer group">
                                                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-card-border group-hover:scale-105 transition-transform">
                                                    {friend.image ? (
                                                        <Image src={friend.image} alt={friend.name || ""} width={48} height={48} className="object-cover" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground group-hover:text-primary transition-colors">{friend.name || "User"}</p>
                                                    <div className="flex items-center gap-1 text-xs text-yellow-500 font-medium mt-0.5">
                                                        <Coins className="w-3 h-3" />
                                                        {friend.coins.toLocaleString()}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground border border-dashed border-card-border rounded-xl bg-secondary/10">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No friends yet. Add some!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Add Friend */}
                            <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold font-display mb-4">Add Friend</h3>
                                <form onSubmit={handleAddFriend} className="space-y-4">
                                    <div className="relative">
                                        <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={friendUsername}
                                            onChange={(e) => setFriendUsername(e.target.value)}
                                            placeholder="Enter username..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isAddingFriend || !friendUsername.trim()}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-all disabled:opacity-50"
                                    >
                                        {isAddingFriend ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Request"}
                                    </button>
                                    {friendError && (
                                        <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{friendError}</p>
                                    )}
                                    {friendSuccess && (
                                        <p className="text-xs text-green-500 bg-green-500/10 p-2 rounded">{friendSuccess}</p>
                                    )}
                                </form>
                            </div>

                            {/* Pending Requests */}
                            {currentPendingRequests.length > 0 && (
                                <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="relative">
                                            <Users className="w-5 h-5 text-yellow-500" />
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-card" />
                                        </div>
                                        <h3 className="text-lg font-bold font-display">Pending Requests</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {currentPendingRequests.map(({ friendshipId, user: friend }) => (
                                            <div key={friendshipId} className="p-3 bg-secondary/30 border border-card-border rounded-lg">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                                        {friend.image ? (
                                                            <Image src={friend.image} alt={friend.name || ""} width={32} height={32} className="object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">{friend.name}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => handleFriendRequest(friendshipId, "accept")}
                                                        disabled={processingRequestId === friendshipId}
                                                        className="py-1.5 bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold rounded"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleFriendRequest(friendshipId, "reject")}
                                                        disabled={processingRequestId === friendshipId}
                                                        className="py-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors text-xs font-bold rounded"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ACTIVITY TAB */}
                {activeTab === "activity" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <BetHistory />
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === "settings" && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border border-card-border rounded-xl p-4 sticky top-4">
                                <h3 className="font-bold font-display text-lg mb-4 px-2">Settings</h3>
                                <nav className="space-y-1">
                                    {[
                                        { id: "profile", label: "Profile", icon: User },
                                        { id: "security", label: "Security", icon: Lock },
                                        { id: "data", label: "Data & Privacy", icon: Database },
                                    ].map((section) => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSettingsSection(section.id as any)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-sm font-medium",
                                                    activeSettingsSection === section.id
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {section.label}
                                            </button>
                                        );
                                    })}
                                </nav>
                                <div className="mt-8 pt-4 border-t border-card-border">
                                    <button
                                        onClick={async () => { await signOut(); window.location.href = "/"; }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm font-bold"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-card border border-card-border rounded-xl p-6 md:p-8">
                                {/* Profile Settings */}
                                {activeSettingsSection === "profile" && (
                                    <div className="max-w-xl">
                                        <h2 className="text-2xl font-bold font-display mb-6">Profile Information</h2>
                                        <form onSubmit={handleChangeName} className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">
                                                        Display Name
                                                    </label>
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        placeholder="Your display name"
                                                        className="w-full px-4 py-3 bg-secondary/30 border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-muted-foreground">
                                                        Email Address
                                                    </label>
                                                    <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border border-card-border rounded-lg opacity-70 cursor-not-allowed">
                                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm text-foreground">{user.email}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground"> Email address cannot be changed directly.</p>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isChangingName || newName === user.name}
                                                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isChangingName ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                                ) : nameSuccess ? (
                                                    <><Check className="w-4 h-4" /> Saved!</>
                                                ) : (
                                                    "Save Changes"
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Security Settings */}
                                {activeSettingsSection === "security" && (
                                    <div className="max-w-xl">
                                        <h2 className="text-2xl font-bold font-display mb-6">Security</h2>
                                        <form onSubmit={handleChangePassword} className="space-y-6">
                                            {passwordError && (
                                                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">{passwordError}</div>
                                            )}
                                            {passwordSuccess && (
                                                <div className="p-3 bg-green-500/10 text-green-500 text-sm rounded-lg border border-green-500/20 flex items-center gap-2">
                                                    <Check className="w-4 h-4" /> Password updated successfully!
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="current" className="block text-sm font-medium text-muted-foreground">Current Password</label>
                                                    <div className="relative">
                                                        <input
                                                            id="current"
                                                            type={showCurrentPassword ? "text" : "password"}
                                                            value={currentPassword}
                                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                                            className="w-full px-4 py-3 pr-10 bg-secondary/30 border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                            placeholder="••••••••"
                                                        />
                                                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="new" className="block text-sm font-medium text-muted-foreground">New Password</label>
                                                    <div className="relative">
                                                        <input
                                                            id="new"
                                                            type={showNewPassword ? "text" : "password"}
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className="w-full px-4 py-3 pr-10 bg-secondary/30 border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                            placeholder="Min 8 chars"
                                                        />
                                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="confirm" className="block text-sm font-medium text-muted-foreground">Confirm New Password</label>
                                                    <input
                                                        id="confirm"
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full px-4 py-3 bg-secondary/30 border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isChangingPassword || !currentPassword || !newPassword}
                                                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Change Password"}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Data & Privacy */}
                                {activeSettingsSection === "data" && (
                                    <div className="max-w-xl space-y-8">
                                        <div>
                                            <h2 className="text-2xl font-bold font-display mb-2">Data & Privacy</h2>
                                            <p className="text-muted-foreground">Manage your personal data and account deletion.</p>
                                        </div>

                                        <div className="p-5 bg-secondary/20 border border-card-border rounded-xl flex items-start gap-4">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Download className="w-5 h-5" /></div>
                                            <div>
                                                <h4 className="font-bold mb-1">Export Data</h4>
                                                <p className="text-sm text-muted-foreground mb-4">Download a copy of your personal data, including bet history.</p>
                                                <button onClick={handleExportData} disabled={isExporting} className="px-4 py-2 bg-background border border-card-border hover:bg-secondary transition-colors rounded-lg text-sm font-bold flex items-center gap-2">
                                                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4" /> Download JSON</>}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-destructive/5 border border-destructive/20 rounded-xl flex items-start gap-4">
                                            <div className="p-2 bg-destructive/10 rounded-lg text-destructive"><Trash2 className="w-5 h-5" /></div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-destructive mb-1">Delete Account</h4>
                                                <p className="text-sm text-destructive/70 mb-4">Permanently remove your account and all data. This cannot be undone.</p>

                                                {!showDeleteConfirm ? (
                                                    <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-destructive text-white hover:bg-destructive/90 transition-colors rounded-lg text-sm font-bold">
                                                        Delete Account
                                                    </button>
                                                ) : (
                                                    <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                                                        <div className="flex items-center gap-2 text-destructive font-bold mb-2">
                                                            <AlertTriangle className="w-4 h-4" /> Are you sure?
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button onClick={handleDeleteAccount} disabled={isDeleting} className="px-3 py-1.5 bg-destructive text-white rounded text-xs font-bold hover:bg-destructive/90">
                                                                {isDeleting ? "Deleting..." : "Yes, Delete"}
                                                            </button>
                                                            <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 bg-background border border-destructive/30 text-destructive rounded text-xs font-bold hover:bg-destructive/5">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
