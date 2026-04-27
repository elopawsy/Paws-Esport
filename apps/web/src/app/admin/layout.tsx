"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userRole, setUserRole] = useState<string>("user");

    useEffect(() => {
        if (!isPending) {
            const user = session?.user as { role?: string } | undefined;
            const role = user?.role || "user";

            // Admin has full access
            // Bet manager can only access /admin/bets
            const isAdmin = role === "admin";
            const isBetManager = role === "bet_manager";
            const isBetsPage = pathname.startsWith("/admin/bets");

            if (!session) {
                router.push("/");
            } else if (isAdmin) {
                setUserRole("admin");
                setIsAuthorized(true);
            } else if (isBetManager && isBetsPage) {
                setUserRole("bet_manager");
                setIsAuthorized(true);
            } else if (isBetManager && !isBetsPage) {
                // Bet manager trying to access other admin pages
                router.push("/admin/bets");
            } else {
                router.push("/");
            }
        }
    }, [session, isPending, router, pathname]);

    if (isPending || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const isAdmin = userRole === "admin";

    return (
        <div className="min-h-screen bg-background">
            {/* Admin Header */}
            <div className="border-b border-card-border bg-card">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-display font-bold uppercase tracking-wide">
                                {isAdmin ? "Admin Panel" : "Gestion des Paris"}
                            </h1>
                            <nav className="flex items-center gap-2">
                                {isAdmin && (
                                    <>
                                        <a
                                            href="/admin"
                                            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                                        >
                                            Dashboard
                                        </a>
                                        <a
                                            href="/admin/bets"
                                            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                                        >
                                            Gestion des Paris
                                        </a>
                                        <a
                                            href="/admin/users"
                                            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                                        >
                                            Utilisateurs
                                        </a>
                                    </>
                                )}
                            </nav>
                        </div>
                        <a
                            href="/"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ← Retour au site
                        </a>
                    </div>
                </div>
            </div>

            {/* Admin Content */}
            <main className="container-custom py-8">
                {children}
            </main>
        </div>
    );
}

