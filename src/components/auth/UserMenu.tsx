"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, LogOut, Coins, Heart, Users, ChevronDown, Loader2, Shield, TrendingUp } from "lucide-react";

export default function UserMenu() {
    const { data: session, isPending } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        window.location.reload();
    };

    if (isPending) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    const user = session.user;
    const displayName = user.name || user.email?.split("@")[0] || "User";
    const coins = (user as { coins?: number }).coins ?? 1000;
    const userRole = (user as { role?: string }).role || "user";
    const isAdmin = userRole === "admin";
    const isBetManager = userRole === "bet_manager";
    const hasAdminAccess = isAdmin || isBetManager;

    return (
        <div ref={menuRef} className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-card-border hover:border-primary/50 transition-colors"
            >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={displayName}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <User className="w-4 h-4 text-primary" />
                    )}
                </div>

                {/* Coins display */}
                <div className="hidden sm:flex items-center gap-1 text-sm">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{coins.toLocaleString()}</span>
                </div>

                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-card-border rounded-lg shadow-xl overflow-hidden z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-card-border">
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">{displayName}</p>
                            {hasAdminAccess && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isAdmin ? "bg-purple-500/20 text-purple-500" : "bg-blue-500/20 text-blue-500"}`}>
                                    {isAdmin ? "ADMIN" : "BET MGR"}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>

                        {/* Coins */}
                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-yellow-500/10 rounded-md">
                            <Coins className="w-5 h-5 text-yellow-500" />
                            <span className="font-bold text-yellow-500">{coins.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground">coins</span>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 transition-colors"
                        >
                            <User className="w-4 h-4 text-muted-foreground" />
                            My Profile
                        </Link>
                        <Link
                            href="/profile#favorite-team"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 transition-colors"
                        >
                            <Heart className="w-4 h-4 text-muted-foreground" />
                            Favorite Team
                        </Link>
                        <Link
                            href="/profile#friends"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 transition-colors"
                        >
                            <Users className="w-4 h-4 text-muted-foreground" />
                            Friends
                        </Link>
                    </div>

                    {/* Admin Section */}
                    {hasAdminAccess && (
                        <div className="border-t border-card-border py-1">
                            {isBetManager && !isAdmin && (
                                <Link
                                    href="/admin/bets"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-500 hover:bg-blue-500/10 transition-colors"
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    Gérer les Paris
                                </Link>
                            )}
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-500 hover:bg-purple-500/10 transition-colors"
                                >
                                    <Shield className="w-4 h-4" />
                                    Panel Admin
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Settings */}
                    <div className="border-t border-card-border py-1">
                        <div className="flex items-center justify-between px-4 py-2.5 text-sm text-foreground">
                            <span className="font-medium">Theme</span>
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-card-border py-1">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

