"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

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
                    {/* Search Bar */}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.querySelector('input') as HTMLInputElement;
                        if (input.value.trim()) {
                            router.push(`/search?q=${encodeURIComponent(input.value)}`);
                        }
                    }} className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-secondary/50 border border-card-border rounded-lg py-1.5 pl-4 pr-10 text-sm text-foreground focus:outline-none focus:border-primary/50 w-64 transition-all placeholder:text-muted-foreground"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                            <Search className="w-4 h-4" />
                        </button>
                    </form>

                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
