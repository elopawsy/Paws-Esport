"use client";

import Image from "next/image";
import { useDroppable } from "@dnd-kit/core";
import { Team } from "@/lib/types";
import PlayerCard from "./PlayerCard";

interface TeamRosterProps {
    team: Team;
}

export default function TeamRoster({ team }: TeamRosterProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: `team-${team.id}`,
        data: {
            team,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`
        bg-card border ${isOver ? "border-primary ring-1 ring-primary" : "border-card-border"} 
        p-6 rounded-lg transition-all duration-200
      `}
        >
            {/* Team Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-card-border">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    {team.image_url ? (
                         <Image
                            src={team.image_url}
                            alt={team.name}
                            fill
                            sizes="48px"
                            className="object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = `<span class="text-xl font-display text-muted">${team.name.charAt(0)}</span>`;
                            }}
                        />
                    ) : (
                         <span className="text-xl font-display text-muted">{team.name.charAt(0)}</span>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-display font-bold tracking-wide uppercase text-foreground">{team.name}</h2>
                    <p className="text-primary text-xs uppercase tracking-widest font-medium">
                        {team.players.length} Players
                    </p>
                </div>
            </div>

            {/* Drop Zone Indicator */}
            {isOver && (
                <div
                    className="mb-4 py-3 rounded border border-dashed border-primary text-center text-sm font-medium text-primary uppercase tracking-wider bg-primary/10"
                >
                    Drop Player Here
                </div>
            )}

            {/* Players List */}
            <div className="space-y-2">
                {team.players.map((player) => (
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
                <div className="py-8 text-center bg-background/50 rounded border border-dashed border-card-border">
                    <p className="text-muted text-xs uppercase tracking-widest">No Active Roster</p>
                </div>
            )}
        </div>
    );
}