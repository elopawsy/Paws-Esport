"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Search } from "lucide-react";

interface BetOption {
    id: string;
    matchId: number;
    matchName: string;
    team1Id: number;
    team1Name: string;
    team1Odds: number;
    team2Id: number;
    team2Name: string;
    team2Odds: number;
    isActive: boolean;
    scheduledAt: string | null;
    expiresAt: string | null;
}

interface Match {
    id: number;
    name: string;
    slug: string;
    scheduled_at: string | null;
    opponents: Array<{
        opponent: {
            id: number;
            name: string;
            acronym?: string;
            image_url?: string;
        };
    }>;
}

interface Template {
    id: string;
    name: string;
    description: string;
    team1Odds: number;
    team2Odds: number;
}

interface BetOptionFormProps {
    editingOption: BetOption | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function BetOptionForm({ editingOption, onSuccess, onCancel }: BetOptionFormProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Match[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [team1Odds, setTeam1Odds] = useState(editingOption?.team1Odds || 2.0);
    const [team2Odds, setTeam2Odds] = useState(editingOption?.team2Odds || 2.0);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch templates on mount
    useEffect(() => {
        fetch("/api/admin/bet-options/templates")
            .then((res) => res.json())
            .then((data) => setTemplates(data.templates || []))
            .catch(() => { });
    }, []);

    // Search for matches
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=matches&limit=10`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.results?.matches || []);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectMatch = (match: Match) => {
        setSelectedMatch(match);
        setSearchResults([]);
        setSearchQuery("");
    };

    const handleApplyTemplate = (template: Template) => {
        setTeam1Odds(template.team1Odds);
        setTeam2Odds(template.team2Odds);
    };

    const handleSubmit = async () => {
        if (!editingOption && !selectedMatch) {
            setError("Veuillez sélectionner un match");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const url = editingOption
                ? `/api/admin/bet-options/${editingOption.id}`
                : "/api/admin/bet-options";

            const method = editingOption ? "PUT" : "POST";

            const body = editingOption
                ? { team1Odds, team2Odds }
                : {
                    matchId: selectedMatch!.id,
                    matchName: selectedMatch!.name,
                    matchSlug: selectedMatch!.slug,
                    team1Id: selectedMatch!.opponents[0]?.opponent?.id,
                    team1Name: selectedMatch!.opponents[0]?.opponent?.name || "Team 1",
                    team1Logo: selectedMatch!.opponents[0]?.opponent?.image_url,
                    team1Odds,
                    team2Id: selectedMatch!.opponents[1]?.opponent?.id,
                    team2Name: selectedMatch!.opponents[1]?.opponent?.name || "Team 2",
                    team2Logo: selectedMatch!.opponents[1]?.opponent?.image_url,
                    team2Odds,
                    scheduledAt: selectedMatch!.scheduled_at,
                };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Une erreur est survenue");
            } else {
                onSuccess();
            }
        } catch {
            setError("Une erreur est survenue");
        } finally {
            setSaving(false);
        }
    };

    const team1Name = editingOption?.team1Name || selectedMatch?.opponents[0]?.opponent?.name || "Équipe 1";
    const team2Name = editingOption?.team2Name || selectedMatch?.opponents[1]?.opponent?.name || "Équipe 2";

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">
                    {editingOption ? "Modifier le pari" : "Nouveau pari"}
                </h3>
                <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Match Search (only for new) */}
                {!editingOption && (
                    <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                            Rechercher un match
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="Nom du match ou des équipes..."
                                className="flex-1 px-4 py-2 bg-background border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={searching}
                                className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                {searching ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="mt-2 border border-card-border rounded-lg divide-y divide-card-border max-h-60 overflow-y-auto">
                                {searchResults.map((match) => (
                                    <button
                                        key={match.id}
                                        onClick={() => handleSelectMatch(match)}
                                        className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                                    >
                                        <p className="font-medium truncate">{match.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {match.scheduled_at
                                                ? new Date(match.scheduled_at).toLocaleString("fr-FR")
                                                : "Date non définie"}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected Match */}
                        {selectedMatch && (
                            <div className="mt-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                <p className="font-medium">{selectedMatch.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedMatch.opponents[0]?.opponent?.name} vs{" "}
                                    {selectedMatch.opponents[1]?.opponent?.name}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Editing Match Info */}
                {editingOption && (
                    <div className="p-4 bg-secondary/30 border border-card-border rounded-lg">
                        <p className="font-medium">{editingOption.matchName}</p>
                        <p className="text-sm text-muted-foreground">
                            {editingOption.team1Name} vs {editingOption.team2Name}
                        </p>
                    </div>
                )}

                {/* Templates */}
                {templates.length > 0 && (
                    <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                            Templates
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleApplyTemplate(template)}
                                    className="px-3 py-1.5 text-xs bg-secondary border border-card-border rounded-lg hover:border-primary/50 transition-colors"
                                    title={template.description}
                                >
                                    {template.name} ({template.team1Odds} / {template.team2Odds})
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Odds Configuration */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                            Cote {team1Name}
                        </label>
                        <input
                            type="number"
                            value={team1Odds}
                            onChange={(e) => setTeam1Odds(parseFloat(e.target.value) || 1.01)}
                            step="0.05"
                            min="1.01"
                            max="50"
                            className="w-full px-4 py-2 bg-background border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-xl font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                            Cote {team2Name}
                        </label>
                        <input
                            type="number"
                            value={team2Odds}
                            onChange={(e) => setTeam2Odds(parseFloat(e.target.value) || 1.01)}
                            step="0.05"
                            min="1.01"
                            max="50"
                            className="w-full px-4 py-2 bg-background border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-xl font-bold"
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || (!editingOption && !selectedMatch)}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingOption ? "Enregistrer" : "Créer le pari"}
                    </button>
                </div>
            </div>
        </div>
    );
}
