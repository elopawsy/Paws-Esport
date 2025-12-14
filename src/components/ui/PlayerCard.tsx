"use client";

import Image from "next/image";
import { Player } from "@/lib/types";
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

    const countryCode = player.country?.code?.toLowerCase() || "xx";

    if (isCompact) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                className={`
          flex items-center gap-3 p-2 rounded-lg bg-navy-800/50 border border-navy-700
          ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}
          ${isDragging ? "opacity-50 shadow-2xl shadow-cyan-500/20" : ""}
          hover:border-cyan-500/50 transition-all
        `}
            >
                {/* Player Image */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-navy-700 flex-shrink-0">
                    <Image
                        src={player.image}
                        alt={player.ign || player.name}
                        fill
                        sizes="40px"
                        className="object-cover object-top"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://static.hltv.org/images/playerprofile/bodyshot/unknown.png";
                        }}
                    />
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{player.ign || player.name}</p>
                    <div className="flex items-center gap-1">
                        <span className="text-xs">{getFlagEmoji(countryCode)}</span>
                        <span className="text-xs text-gray-400 truncate">{player.country?.name}</span>
                    </div>
                </div>

                {/* Drag Indicator */}
                {isDraggable && (
                    <div className="text-gray-500 hover:text-cyan-400 transition-colors">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 8h16M4 16h16"
                            />
                        </svg>
                    </div>
                )}
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
        group relative bg-navy-800/50 backdrop-blur-sm border border-navy-700 rounded-xl p-4
        ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}
        ${isDragging ? "opacity-50 shadow-2xl shadow-cyan-500/20" : ""}
        hover:border-cyan-500/50 hover:bg-navy-800 transition-all duration-300
      `}
        >
            {/* Country Flag */}
            <div className="absolute top-3 right-3 text-xl">
                {getFlagEmoji(countryCode)}
            </div>

            {/* Player Image */}
            <div className="relative w-24 h-28 mx-auto mb-3 rounded-lg overflow-hidden bg-gradient-to-b from-navy-700 to-navy-800">
                <Image
                    src={player.image}
                    alt={player.ign || player.name}
                    fill
                    sizes="96px"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://static.hltv.org/images/playerprofile/bodyshot/unknown.png";
                    }}
                />
            </div>

            {/* Player IGN */}
            <h4 className="text-center font-bold text-white text-lg group-hover:text-cyan-400 transition-colors">
                {player.ign || player.name}
            </h4>

            {/* Real Name */}
            <p className="text-center text-gray-400 text-sm truncate">
                {player.name}
            </p>

            {/* Role Badge */}
            {player.type && (
                <div className="mt-2 flex justify-center">
                    <span className="px-2 py-1 text-xs font-medium bg-navy-700 rounded-full text-gray-300 capitalize">
                        {player.type}
                    </span>
                </div>
            )}

            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
}

// Helper to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
    if (!countryCode || countryCode === "xx") return "🏳️";

    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);

    return String.fromCodePoint(...codePoints);
}
