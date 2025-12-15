"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Teams" },
        { href: "/simulator", label: "Simulator" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-card-border">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-display font-bold tracking-tight">
                    NEXUS
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-8">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium tracking-wide transition-colors ${
                                    isActive ? "text-white" : "text-muted hover:text-white"
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
