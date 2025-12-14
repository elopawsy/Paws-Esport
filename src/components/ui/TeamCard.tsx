"use client";

import Link from "next/link";
import { TeamRanking } from "@/lib/types";

interface TeamCardProps {
    team: TeamRanking;
}

export default function TeamCard({ team }: TeamCardProps) {
    const rankChangeColor =
        team.rankChange > 0
            ? "text-green-400"
            : team.rankChange < 0
                ? "text-red-400"
                : "text-gray-500";

    const rankChangeIcon =
        team.rankChange > 0 ? "↑" : team.rankChange < 0 ? "↓" : "•";

    return (
        <Link href={`/teams/${team.id}`}>
            <div className="group relative bg-navy-800/50 backdrop-blur-sm border border-navy-700 rounded-xl p-4 hover:border-hltv-orange/50 hover:bg-navy-800 transition-all duration-300 cursor-pointer overflow-hidden">
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-gradient-to-br from-hltv-orange to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {team.rank}
                </div>

                {/* Rank Change */}
                <div className={`absolute top-3 right-3 text-sm font-medium ${rankChangeColor}`}>
                    {rankChangeIcon} {Math.abs(team.rankChange) || ""}
                </div>

                {/* Team Logo */}
                <div className="flex justify-center mt-6 mb-4">
                    <div className="relative w-20 h-20 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                        <img
                            src={team.logo}
                            alt={team.name}
                            className="w-16 h-16 object-contain drop-shadow-lg"
                            loading="lazy"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.parentElement!.innerHTML = `<span class="text-3xl font-bold text-orange-500">${team.name.charAt(0)}</span>`;
                            }}
                        />
                    </div>
                </div>

                {/* Team Name */}
                <h3 className="text-center font-bold text-white text-lg mb-1 group-hover:text-hltv-orange transition-colors">
                    {team.name}
                </h3>

                {/* Points */}
                <p className="text-center text-gray-400 text-sm">
                    {team.points} points
                </p>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-hltv-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
        </Link>
    );
}

