"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, LogOut, Coins, Heart, Users, ChevronDown, Loader2 } from "lucide-react";

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
                        <p className="font-medium text-foreground truncate">{displayName}</p>
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
