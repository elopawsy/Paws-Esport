"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import SearchBarWithSuggestions from "./SearchBarWithSuggestions";
import { ChevronDown, Gamepad } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [showMinigames, setShowMinigames] = useState(false);

    const links = [
        { href: "/", label: "Home" },
        { href: "/tournaments", label: "Tournaments" },
        { href: "/teams", label: "Teams" },
        { href: "/simulator", label: "Simulator" },
    ];

    const minigames = [
        { href: "/games/wordle", label: "Esportsle", description: "Guess the pro player" },
    ];

    return (
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

                {/* Search and Settings */}
                <div className="flex items-center gap-4">
                    {/* Search Bar with Suggestions */}
                    <SearchBarWithSuggestions />

                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
