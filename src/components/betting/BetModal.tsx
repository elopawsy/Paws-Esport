"use client";

import { useState } from "react";
import { X, Coins, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Team {
    id: number;
    name: string;
    acronym?: string;
    image_url?: string;
}

interface BetModalProps {
    isOpen: boolean;
    onClose: () => void;
    matchId: number;
    teams: Team[];
    matchName: string;
    onBetPlaced?: (newBalance: number) => void;
}

export default function BetModal({ isOpen, onClose, matchId, teams, matchName, onBetPlaced }: BetModalProps) {
    const { data: session } = useSession();
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [amount, setAmount] = useState<number>(100);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const userCoins = (session?.user as { coins?: number })?.coins ?? 0;
    const odds = 2.0; // Default odds
    const potentialWin = Math.floor(amount * odds);

    const quickAmounts = [50, 100, 250, 500, 1000];

    const handlePlaceBet = async () => {
        if (!selectedTeam) {
            setError("Choisis une équipe");
            return;
        }
        if (amount < 10) {
            setError("Mise minimum: 10 coins");
            return;
        }
        if (amount > userCoins) {
            setError("Solde insuffisant");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/bets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    matchId,
                    teamId: selectedTeam.id,
                    amount,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Une erreur est survenue");
            } else {
                setSuccess(true);
                if (onBetPlaced) {
                    onBetPlaced(data.newBalance);
                }
                // Close after short delay
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setSelectedTeam(null);
                    setAmount(100);
                }, 2000);
            }
        } catch {
            setError("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-card-border rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="px-6 py-4 border-b border-card-border">
                    <h2 className="text-lg font-bold font-display uppercase">Placer un Pari</h2>
                    <p className="text-sm text-muted-foreground truncate">{matchName}</p>
                </div>

                {success ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Pari placé !</h3>
                        <p className="text-muted-foreground">
                            {amount} coins sur {selectedTeam?.name || selectedTeam?.acronym}
                        </p>
                        <p className="text-primary font-bold mt-2">
                            Gain potentiel: {potentialWin} coins
                        </p>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Balance display */}
                        <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                            <span className="text-sm text-muted-foreground">Ton solde</span>
                            <div className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-yellow-500" />
                                <span className="font-bold text-yellow-500">{userCoins.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Team selection */}
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Choisis ton équipe
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {teams.map((team) => (
                                    <button
                                        key={team.id}
                                        onClick={() => setSelectedTeam(team)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${selectedTeam?.id === team.id
                                                ? "border-primary bg-primary/10"
                                                : "border-card-border hover:border-primary/50"
                                            }`}
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center">
                                            {team.image_url ? (
                                                <img
                                                    src={team.image_url}
                                                    alt={team.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <span className="text-lg font-bold text-muted">
                                                    {team.acronym || team.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium truncate w-full text-center">
                                            {team.acronym || team.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount input */}
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Montant du pari
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                                min={10}
                                max={10000}
                                className="w-full px-4 py-3 bg-background border border-card-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-center text-xl font-bold"
                            />
                            <div className="flex gap-2 mt-2">
                                {quickAmounts.map((quickAmount) => (
                                    <button
                                        key={quickAmount}
                                        onClick={() => setAmount(quickAmount)}
                                        disabled={quickAmount > userCoins}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${amount === quickAmount
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-card-border hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            }`}
                                    >
                                        {quickAmount}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Potential win */}
                        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <div>
                                <span className="text-xs text-muted-foreground block">Gain potentiel</span>
                                <span className="text-2xl font-bold text-primary">{potentialWin.toLocaleString()}</span>
                                <span className="text-sm text-primary ml-1">coins</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-muted-foreground block">Cote</span>
                                <span className="text-lg font-bold text-foreground">x{odds}</span>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            onClick={handlePlaceBet}
                            disabled={isLoading || !selectedTeam || amount < 10 || amount > userCoins}
                            className="w-full py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Placement...
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="w-4 h-4" />
                                    Parier {amount} coins
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
