"use client";

import { useState, useEffect, useCallback } from "react";
import { Transfer, TeamFull, Player } from "@/lib/types";

const STORAGE_KEY = "cs-transfer-simulator-state";

interface TransferState {
    modifiedTeams: Record<number, TeamFull>;
    transfers: Transfer[];
}

export function useTransfers() {
    const [state, setState] = useState<TransferState>({
        modifiedTeams: {},
        transfers: [],
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setState(parsed);
            } catch (e) {
                console.error("Failed to parse stored transfers:", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state, isLoaded]);

    const getModifiedTeam = useCallback(
        (team: TeamFull): TeamFull => {
            return state.modifiedTeams[team.id] || team;
        },
        [state.modifiedTeams]
    );

    const transferPlayer = useCallback(
        (player: Player, fromTeam: TeamFull, toTeam: TeamFull) => {
            const transfer: Transfer = {
                id: `${Date.now()}-${player.id}`,
                player,
                fromTeam: {
                    id: fromTeam.id,
                    name: fromTeam.name,
                    logo: fromTeam.logo,
                },
                toTeam: {
                    id: toTeam.id,
                    name: toTeam.name,
                    logo: toTeam.logo,
                },
                timestamp: Date.now(),
            };

            setState((prev) => {
                // Get current state of both teams
                const currentFromTeam = prev.modifiedTeams[fromTeam.id] || fromTeam;
                const currentToTeam = prev.modifiedTeams[toTeam.id] || toTeam;

                // Remove player from source team
                const updatedFromTeam: TeamFull = {
                    ...currentFromTeam,
                    players: currentFromTeam.players.filter((p) => p.id !== player.id),
                };

                // Add player to destination team
                const updatedToTeam: TeamFull = {
                    ...currentToTeam,
                    players: [...currentToTeam.players, player],
                };

                return {
                    modifiedTeams: {
                        ...prev.modifiedTeams,
                        [fromTeam.id]: updatedFromTeam,
                        [toTeam.id]: updatedToTeam,
                    },
                    transfers: [...prev.transfers, transfer],
                };
            });
        },
        []
    );

    const undoTransfer = useCallback((transferId: string) => {
        setState((prev) => {
            const transfer = prev.transfers.find((t) => t.id === transferId);
            if (!transfer) return prev;

            const fromTeam = prev.modifiedTeams[transfer.fromTeam.id];
            const toTeam = prev.modifiedTeams[transfer.toTeam.id];

            if (!fromTeam || !toTeam) return prev;

            // Move player back
            const updatedFromTeam: TeamFull = {
                ...fromTeam,
                players: [...fromTeam.players, transfer.player],
            };

            const updatedToTeam: TeamFull = {
                ...toTeam,
                players: toTeam.players.filter((p) => p.id !== transfer.player.id),
            };

            return {
                modifiedTeams: {
                    ...prev.modifiedTeams,
                    [transfer.fromTeam.id]: updatedFromTeam,
                    [transfer.toTeam.id]: updatedToTeam,
                },
                transfers: prev.transfers.filter((t) => t.id !== transferId),
            };
        });
    }, []);

    const resetAll = useCallback(() => {
        setState({ modifiedTeams: {}, transfers: [] });
    }, []);

    return {
        transfers: state.transfers,
        getModifiedTeam,
        transferPlayer,
        undoTransfer,
        resetAll,
        isLoaded,
    };
}
