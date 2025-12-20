"use client";

import { useState, useEffect } from "react";
import { Settings, Check, Loader2 } from "lucide-react";

interface ManageBetButtonProps {
    matchId: number;
    matchName: string;
    matchSlug?: string;
    team1: { id: number; name: string; logo?: string };
    team2: { id: number; name: string; logo?: string };
    scheduledAt?: string;
}

interface BetOption {
    id: string;
    team1Odds: number;
    team2Odds: number;
    isActive: boolean;
}

interface Template {
    id: string;
    name: string;
    team1Odds: number;
    team2Odds: number;
}

export default function ManageBetButton({
    matchId,
    matchName,
    matchSlug,
    team1,
    team2,
    scheduledAt,
}: ManageBetButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [existingBet, setExistingBet] = useState<BetOption | null>(null);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [team1Odds, setTeam1Odds] = useState(2.0);
    const [team2Odds, setTeam2Odds] = useState(2.0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch existing bet and templates when modal opens
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setError(null);
            setSuccess(false);

            Promise.all([
                fetch(`/api/bets/available?matchId=${matchId}`).then((r) => r.json()),
                fetch("/api/admin/bet-options/templates").then((r) => r.json()),
            ])
                .then(([betData, templateData]) => {
                    if (betData.betOption) {
                        setExistingBet(betData.betOption);
                        setTeam1Odds(betData.betOption.team1Odds);
                        setTeam2Odds(betData.betOption.team2Odds);
                    } else {
                        setExistingBet(null);
                        setTeam1Odds(2.0);
                        setTeam2Odds(2.0);
                    }
                    setTemplates(templateData.templates || []);
                })
                .catch(() => setError("Erreur de chargement"))
                .finally(() => setLoading(false));
        }
    }, [isOpen, matchId]);

    const handleApplyTemplate = (template: Template) => {
        setTeam1Odds(template.team1Odds);
        setTeam2Odds(template.team2Odds);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            if (existingBet) {
                // Update existing
                const res = await fetch(`/api/admin/bet-options/${existingBet.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ team1Odds, team2Odds }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Erreur de sauvegarde");
                }
            } else {
                // Create new
                const res = await fetch("/api/admin/bet-options", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        matchId,
                        matchName,
                        matchSlug,
                        team1Id: team1.id,
                        team1Name: team1.name,
                        team1Logo: team1.logo,
                        team1Odds,
                        team2Id: team2.id,
                        team2Name: team2.name,
                        team2Logo: team2.logo,
                        team2Odds,
                        scheduledAt,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Erreur de création");
                }

                const data = await res.json();
                setExistingBet(data.betOption);
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async () => {
        if (!existingBet) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/bet-options/${existingBet.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !existingBet.isActive }),
            });

            if (res.ok) {
                setExistingBet({ ...existingBet, isActive: !existingBet.isActive });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-lg text-xs font-bold hover:bg-purple-500/20 transition-colors"
            >
                <Settings className="w-4 h-4" />
                Gérer Pari
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative bg-card border border-card-border rounded-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-bold mb-4">Gérer le pari</h3>
                        <p className="text-sm text-muted-foreground mb-6 truncate">
                            {matchName}
                        </p>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Existing bet status */}
                                {existingBet && (
                                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                        <span className="text-sm">
                                            Pari {existingBet.isActive ? "actif" : "inactif"}
                                        </span>
                                        <button
                                            onClick={handleToggleActive}
                                            disabled={saving}
                                            className={`px-3 py-1 text-xs font-bold rounded ${existingBet.isActive ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"}`}
                                        >
                                            {existingBet.isActive ? "Désactiver" : "Activer"}
                                        </button>
                                    </div>
                                )}

                                {/* Templates */}
                                {templates.length > 0 && (
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-2 block">Templates</label>
                                        <div className="flex flex-wrap gap-2">
                                            {templates.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleApplyTemplate(t)}
                                                    className="px-2 py-1 text-xs bg-secondary border border-card-border rounded hover:border-primary/50"
                                                >
                                                    {t.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Odds */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">{team1.name}</label>
                                        <input
                                            type="number"
                                            value={team1Odds}
                                            onChange={(e) => setTeam1Odds(parseFloat(e.target.value) || 1.01)}
                                            step="0.05"
                                            min="1.01"
                                            max="50"
                                            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-center text-lg font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">{team2.name}</label>
                                        <input
                                            type="number"
                                            value={team2Odds}
                                            onChange={(e) => setTeam2Odds(parseFloat(e.target.value) || 1.01)}
                                            step="0.05"
                                            min="1.01"
                                            max="50"
                                            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-center text-lg font-bold"
                                        />
                                    </div>
                                </div>

                                {/* Error/Success */}
                                {error && (
                                    <div className="p-2 bg-destructive/10 text-destructive text-xs rounded">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-2 bg-green-500/10 text-green-500 text-xs rounded flex items-center gap-2">
                                        <Check className="w-4 h-4" /> Sauvegardé!
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {existingBet ? "Mettre à jour" : "Créer le pari"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
