"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Power, Loader2, Search } from "lucide-react";
import BetOptionForm from "@/components/admin/BetOptionForm";

interface BetOption {
    id: string;
    matchId: number;
    matchName: string;
    matchSlug: string | null;
    team1Id: number;
    team1Name: string;
    team1Logo: string | null;
    team1Odds: number;
    team2Id: number;
    team2Name: string;
    team2Logo: string | null;
    team2Odds: number;
    isActive: boolean;
    scheduledAt: string | null;
    expiresAt: string | null;
    createdAt: string;
}

export default function AdminBetsPage() {
    const [betOptions, setBetOptions] = useState<BetOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOption, setEditingOption] = useState<BetOption | null>(null);

    const fetchBetOptions = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/bet-options");
            if (res.ok) {
                const data = await res.json();
                setBetOptions(data.betOptions);
            }
        } catch (error) {
            console.error("Error fetching bet options:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBetOptions();
    }, [fetchBetOptions]);

    const handleToggleActive = async (option: BetOption) => {
        try {
            const res = await fetch(`/api/admin/bet-options/${option.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !option.isActive }),
            });

            if (res.ok) {
                fetchBetOptions();
            }
        } catch (error) {
            console.error("Error toggling bet option:", error);
        }
    };

    const handleDelete = async (option: BetOption) => {
        if (!confirm(`Supprimer le pari "${option.matchName}" ?`)) return;

        try {
            const res = await fetch(`/api/admin/bet-options/${option.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchBetOptions();
            }
        } catch (error) {
            console.error("Error deleting bet option:", error);
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingOption(null);
        fetchBetOptions();
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold mb-2">
                        Gestion des Paris
                    </h2>
                    <p className="text-muted-foreground">
                        Créez et gérez les options de paris sur les matchs
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau Pari
                </button>
            </div>

            {/* Form Modal */}
            {(showForm || editingOption) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                            setShowForm(false);
                            setEditingOption(null);
                        }}
                    />
                    <div className="relative bg-card border border-card-border rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <BetOptionForm
                            editingOption={editingOption}
                            onSuccess={handleFormSuccess}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingOption(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Bet Options List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : betOptions.length === 0 ? (
                <div className="text-center py-20 bg-card border border-card-border rounded-xl">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Aucun pari créé</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-primary hover:underline"
                    >
                        Créer votre premier pari
                    </button>
                </div>
            ) : (
                <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-card-border bg-secondary/30">
                                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Match
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Équipe 1
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Équipe 2
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">
                            {betOptions.map((option) => (
                                <tr key={option.id} className="hover:bg-secondary/20">
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-medium truncate max-w-[200px]">
                                                {option.matchName}
                                            </p>
                                            {option.scheduledAt && (
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(option.scheduledAt).toLocaleString("fr-FR")}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-sm">{option.team1Name}</span>
                                            <span className="text-lg font-bold text-green-500">
                                                x{option.team1Odds.toFixed(2)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-sm">{option.team2Name}</span>
                                            <span className="text-lg font-bold text-green-500">
                                                x{option.team2Odds.toFixed(2)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded ${option.isActive
                                                    ? "bg-green-500/10 text-green-500"
                                                    : "bg-gray-500/10 text-gray-500"
                                                }`}
                                        >
                                            {option.isActive ? "Actif" : "Inactif"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleActive(option)}
                                                className={`p-2 rounded-lg transition-colors ${option.isActive
                                                        ? "hover:bg-yellow-500/10 text-yellow-500"
                                                        : "hover:bg-green-500/10 text-green-500"
                                                    }`}
                                                title={option.isActive ? "Désactiver" : "Activer"}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingOption(option)}
                                                className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(option)}
                                                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
