"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";

interface Stats {
    totalUsers: number;
    totalBets: number;
    activeBetOptions: number;
    pendingBets: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/admin/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const statCards = [
        {
            title: "Utilisateurs",
            value: stats?.totalUsers ?? "—",
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Paris Actifs",
            value: stats?.activeBetOptions ?? "—",
            icon: TrendingUp,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Total Paris Placés",
            value: stats?.totalBets ?? "—",
            icon: DollarSign,
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
        },
        {
            title: "Paris en Attente",
            value: stats?.pendingBets ?? "—",
            icon: Activity,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-display font-bold mb-2">Dashboard</h2>
                <p className="text-muted-foreground">
                    Vue d&apos;ensemble de l&apos;activité du site
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div
                        key={stat.title}
                        className="bg-card border border-card-border rounded-xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-muted-foreground">{stat.title}</span>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold">
                            {loading ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                stat.value
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                    href="/admin/bets"
                    className="block p-6 bg-card border border-card-border rounded-xl hover:border-primary/50 transition-colors group"
                >
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        Gérer les Paris
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Créer, modifier ou supprimer des options de paris sur les matchs
                    </p>
                </a>
                <a
                    href="/admin/users"
                    className="block p-6 bg-card border border-card-border rounded-xl hover:border-primary/50 transition-colors group"
                >
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        Gérer les Utilisateurs
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Voir les utilisateurs, modifier les rôles et gérer les bannissements
                    </p>
                </a>
            </div>
        </div>
    );
}
