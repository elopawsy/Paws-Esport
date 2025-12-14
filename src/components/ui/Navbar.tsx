"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Équipes" },
        { href: "/simulator", label: "Simulateur" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-sm border-b border-navy-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-hltv-orange to-orange-600 flex items-center justify-center shadow-lg shadow-hltv-orange/20 group-hover:shadow-hltv-orange/40 transition-shadow">
                            <span className="font-bold text-white text-lg">CS</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-white">Transfer Simulator</h1>
                            <p className="text-xs text-gray-400 -mt-1">Propulsé par HLTV</p>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-2">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive
                                            ? "bg-hltv-orange text-white shadow-lg shadow-hltv-orange/30"
                                            : "text-gray-300 hover:text-white hover:bg-navy-800"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
