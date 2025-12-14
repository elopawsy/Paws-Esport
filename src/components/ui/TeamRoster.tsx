"use client";

import Image from "next/image";
import { useDroppable } from "@dnd-kit/core";
import { TeamFull, Player } from "@/lib/types";
import PlayerCard from "./PlayerCard";

interface TeamRosterProps {
    team: TeamFull;
    highlightColor?: "orange" | "cyan";
}

export default function TeamRoster({ team, highlightColor = "orange" }: TeamRosterProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: `team-${team.id}`,
        data: {
            team,
        },
    });

    const borderColor = isOver
        ? highlightColor === "orange"
            ? "border-hltv-orange"
            : "border-cyan-500"
        : "border-navy-700";

    const glowColor = isOver
        ? highlightColor === "orange"
            ? "shadow-hltv-orange/30"
            : "shadow-cyan-500/30"
        : "";

    return (
        <div
            ref={setNodeRef}
            className={`
        bg-navy-800/30 backdrop-blur-sm border-2 ${borderColor} 
        rounded-2xl p-6 transition-all duration-300
        ${isOver ? `shadow-xl ${glowColor}` : ""}
      `}
        >
            {/* Team Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                        src={team.logo}
                        alt={team.name}
                        fill
                        sizes="64px"
                        className="object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://www.hltv.org/img/static/team/placeholder.svg";
                        }}
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">{team.name}</h2>
                    <p className="text-gray-400 text-sm">
                        {team.rank ? `#${team.rank} Mondial` : "Non classé"} • {team.players.length} joueurs
                    </p>
                </div>
            </div>

            {/* Drop Zone Indicator */}
            {isOver && (
                <div
                    className={`
          mb-4 py-3 rounded-lg border-2 border-dashed text-center font-medium animate-pulse
          ${highlightColor === "orange" ? "border-hltv-orange text-hltv-orange" : "border-cyan-500 text-cyan-400"}
        `}
                >
                    Déposer le joueur ici
                </div>
            )}

            {/* Players List */}
            <div className="space-y-2">
                {team.players.map((player: Player) => (
                    <PlayerCard
                        key={player.id}
                        player={player}
                        teamId={team.id}
                        isDraggable={true}
                        isCompact={true}
                    />
                ))}
            </div>

            {/* Empty State */}
            {team.players.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                    <p>Aucun joueur dans cette équipe</p>
                </div>
            )}

            {/* Coach */}
            {team.coach && (
                <div className="mt-6 pt-4 border-t border-navy-700">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Coach</p>
                    <PlayerCard
                        player={team.coach}
                        teamId={team.id}
                        isDraggable={false}
                        isCompact={true}
                    />
                </div>
            )}
        </div>
    );
}
