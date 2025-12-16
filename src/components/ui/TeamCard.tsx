"use client";

import Link from "next/link";
import { Team } from "@/types";

interface TeamCardProps {
    team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
    return (
        <Link href={`/teams/${team.id}`}>
            <div className="group h-full bg-card border border-card-border p-6 hover:border-primary/50 hover:bg-secondary/80 transition-all duration-200 flex flex-col items-center justify-between rounded-md relative overflow-hidden">
                
                {/* Subtle colored glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-12 translate-x-12 group-hover:bg-primary/10 transition-colors" />

                {/* Team Logo */}
                <div className="w-20 h-20 mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 z-10">
                    {team.image_url ? (
                        <img
                            src={team.image_url}
                            alt={team.name}
                            className="w-full h-full object-contain drop-shadow-md"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                             <span className="text-xl font-display text-muted">{team.name.charAt(0)}</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="text-center w-full z-10">
                    <h3 className="font-display font-bold text-xl tracking-wide truncate group-hover:text-primary transition-colors">
                        {team.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium text-muted uppercase tracking-wider">
                         <span className="bg-background/50 px-2 py-1 rounded">{team.acronym || "TEAM"}</span>
                         {team.location && <span>{team.location}</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
}