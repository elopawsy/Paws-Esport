"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import SearchBarWithSuggestions from "./SearchBarWithSuggestions";
import { ChevronDown, Gamepad, LogIn, User, Heart, Users, LogOut, Coins, Settings } from "lucide-react";
import { AuthModal, UserMenu } from "@/components/auth";
import { NotificationCenter } from "@/components/notifications";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navbar() {
    const pathname = usePathname();
    const [showMinigames, setShowMinigames] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { data: session, isPending } = useSession();

    const links = [
        { href: "/", label: "Home" },
        { href: "/tournaments", label: "Tournaments" },
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/simulator", label: "Simulator" },
    ];

    const minigames = [
        { href: "/games/wordle", label: "Esportsle", description: "Guess the pro player" },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-card-border">
                <div className="container-custom h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-display font-medium tracking-tight uppercase">
                        <span className="text-primary font-bold">Paws</span>Esport
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium tracking-wide transition-colors ${isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}

                        {/* Minigames Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setShowMinigames(true)}
                            onMouseLeave={() => setShowMinigames(false)}
                        >
                            <button
                                className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-colors ${pathname.startsWith("/games")
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Gamepad className="w-4 h-4" />
                                Minigames
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {showMinigames && (
                                <div className="absolute top-full left-0 pt-2">
                                    <div className="bg-card border border-card-border rounded-lg shadow-xl overflow-hidden min-w-[200px]">
                                        {minigames.map((game) => (
                                            <Link
                                                key={game.href}
                                                href={game.href}
                                                className="block px-4 py-3 hover:bg-primary/10 transition-colors"
                                            >
                                                <span className="block font-medium text-foreground">{game.label}</span>
                                                <span className="block text-xs text-muted-foreground">{game.description}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search, Auth, and Settings (Desktop & Mobile) */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Search Bar - Hidden on small mobile if needed, or compact */}
                        <div className="hidden sm:block">
                            <SearchBarWithSuggestions />
                        </div>

                        {/* Auth - Show UserMenu if logged in, otherwise login button */}
                        {!isPending && (
                            session?.user ? (
                                <>
                                    <NotificationCenter />
                                    <div className="hidden md:block">
                                        <UserMenu />
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium rounded-md transition-colors"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span className="hidden sm:inline">Login</span>
                                </button>
                            )
                        )}



                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-card-border bg-background fixed inset-x-0 top-16 bottom-0 overflow-y-auto z-40">
                        <div className="container-custom py-4 space-y-4 pb-20">
                            <div className="sm:hidden mb-4">
                                <SearchBarWithSuggestions />
                            </div>

                            {/* Mobile User Profile */}
                            {session?.user && (
                                <div className="border-b border-card-border pb-4 mb-4">
                                    <div className="flex items-center gap-3 px-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                            {session.user.image ? (
                                                <img
                                                    src={session.user.image}
                                                    alt={session.user.name || "User"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{session.user.name || "User"}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{session.user.email}</p>
                                        </div>
                                    </div>

                                    <div className="px-4 mb-4">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 rounded-md">
                                            <Coins className="w-4 h-4 text-yellow-500" />
                                            <span className="font-bold text-yellow-500">{(session.user as any).coins?.toLocaleString() ?? 1000}</span>
                                            <span className="text-xs text-muted-foreground">coins</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                                        >
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/profile#favorite-team"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                                        >
                                            <Heart className="w-4 h-4 text-muted-foreground" />
                                            Favorite Team
                                        </Link>
                                        <Link
                                            href="/profile#friends"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                                        >
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            My Friends
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {links.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`block px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-colors ${isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>

                        </div>

                        {/* Mobile Footer Actions */}
                        <div className="pt-2 border-t border-card-border">
                            <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                <span className="text-sm font-medium text-foreground">Theme</span>
                                <ThemeToggle />
                            </div>

                            {session?.user && (
                                <button
                                    onClick={async () => {
                                        await signOut();
                                        window.location.reload();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors mt-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            )}
                        </div>

                        {!session?.user && (
                            <div className="pt-2 border-t border-card-border sm:hidden">
                                <button
                                    onClick={() => {
                                        setShowAuthModal(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium rounded-lg transition-colors"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Login
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}

