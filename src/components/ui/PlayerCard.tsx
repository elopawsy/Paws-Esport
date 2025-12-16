"use client";

import Image from "next/image";
import { Player } from "@/types";
import { useDraggable } from "@dnd-kit/core";

interface PlayerCardProps {
    player: Player;
    teamId: number;
    isDraggable?: boolean;
    isCompact?: boolean;
}

export default function PlayerCard({
    player,
    teamId,
    isDraggable = true,
    isCompact = false,
}: PlayerCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${player.id}-${teamId}`,
        data: {
            player,
            teamId,
        },
        disabled: !isDraggable,
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            zIndex: isDragging ? 1000 : undefined,
        }
        : undefined;

    const imageUrl = player.image_url || "/player-placeholder.svg";

    if (isCompact) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                className={`
          flex items-center gap-3 p-3 bg-card border border-transparent hover:border-primary/30 rounded-md transition-all
          ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}
          ${isDragging ? "opacity-50 ring-2 ring-primary" : ""}
        `}
            >
                {/* Player Image */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-background flex-shrink-0 border border-card-border">
                    <Image
                        src={imageUrl}
                        alt={player.name}
                        fill
                        sizes="32px"
                        className="object-cover object-top"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                            target.parentElement!.innerHTML = `<span class="text-xs font-bold text-muted">${player.name.charAt(0)}</span>`;
                        }}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-foreground text-base leading-none tracking-wide group-hover:text-primary transition-colors">{player.name}</p>
                    <p className="text-xs text-muted truncate mt-0.5">
                        {player.first_name} {player.last_name}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
        group relative bg-card border border-card-border p-5 flex flex-col items-center rounded-lg transition-all
        ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}
        ${isDragging ? "opacity-50 ring-2 ring-primary" : ""}
        hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5
      `}
        >
            {/* Player Image */}
            <div className="relative w-20 h-20 mb-4 rounded-full overflow-hidden bg-background border-2 border-card-border group-hover:border-primary transition-colors duration-300">
                <Image
                    src={imageUrl}
                    alt={player.name}
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                        target.parentElement!.innerHTML = `<span class="text-2xl font-display text-muted">${player.name.charAt(0)}</span>`;
                    }}
                />
            </div>

            <h4 className="font-display font-bold text-xl tracking-wide text-foreground group-hover:text-primary transition-colors">
                {player.name}
            </h4>

            <p className="text-xs text-muted uppercase tracking-wider mt-1 mb-3">
                {player.first_name} {player.last_name}
            </p>

            {player.role && (
                <span className="px-2 py-1 text-[10px] font-bold text-primary bg-primary/10 rounded uppercase tracking-widest border border-primary/20">
                    {player.role}
                </span>
            )}
        </div>
    );
}