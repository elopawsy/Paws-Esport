"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import SearchBarWithSuggestions from "./SearchBarWithSuggestions";

export default function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home" },
        { href: "/tournaments", label: "Tournaments" },
        { href: "/teams", label: "Teams" },
        { href: "/simulator", label: "Simulator" },
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
