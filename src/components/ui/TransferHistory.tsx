"use client";

import Image from "next/image";
import { Transfer } from "@/types";

interface TransferHistoryProps {
    transfers: Transfer[];
    onUndo: (transferId: string) => void;
    onReset: () => void;
}

export default function TransferHistory({ transfers, onUndo, onReset }: TransferHistoryProps) {
    if (transfers.length === 0) {
        return (
            <div className="bg-navy-800/30 backdrop-blur-sm border border-navy-700 rounded-xl p-6 text-center">
                <div className="text-gray-500 mb-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto mb-3 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                    </svg>
                </div>
                <p className="text-gray-400">Aucun transfert effectué</p>
                <p className="text-gray-500 text-sm mt-1">Glissez des joueurs entre équipes</p>
            </div>
        );
    }

    return (
        <div className="bg-navy-800/30 backdrop-blur-sm border border-navy-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-navy-800 border-b border-navy-700">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                    </svg>
                    Transferts ({transfers.length})
                </h3>
                <button
                    onClick={onReset}
                    className="px-3 py-1.5 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                >
                    Tout annuler
                </button>
            </div>

            {/* Transfers List */}
            <div className="max-h-[400px] overflow-y-auto">
                {[...transfers].reverse().map((transfer) => (
                    <div
                        key={transfer.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-navy-700/50 hover:bg-navy-800/50 transition-colors group"
                    >
                        {/* From Team Logo */}
                        <div className="relative w-8 h-8 flex-shrink-0">
                            <Image
                                src={transfer.fromTeam.image_url || '/placeholder-team.png'}
                                alt={transfer.fromTeam.name}
                                fill
                                sizes="32px"
                                className="object-contain opacity-60"
                            />
                        </div>

                        {/* Arrow */}
                        <div className="text-gray-500">→</div>

                        {/* To Team Logo */}
                        <div className="relative w-8 h-8 flex-shrink-0">
                            <Image
                                src={transfer.toTeam.image_url || '/placeholder-team.png'}
                                alt={transfer.toTeam.name}
                                fill
                                sizes="32px"
                                className="object-contain"
                            />
                        </div>

                        {/* Player Name */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">
                                {transfer.player.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {transfer.fromTeam.name} → {transfer.toTeam.name}
                            </p>
                        </div>

                        {/* Undo Button */}
                        <button
                            onClick={() => onUndo(transfer.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-white hover:bg-navy-700 rounded-lg transition-all"
                            title="Annuler ce transfert"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
