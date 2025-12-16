
"use client";

import { Match } from "@/types";
import { parseBracketMatches, BracketSection } from "@/lib/bracket-parser";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";

interface BracketViewProps {
    matches: Match[];
}

function BracketMatchCard({ match }: { match: Match }) {
    const team1 = match.opponents[0]?.opponent;
    const team2 = match.opponents[1]?.opponent;
    const score1 = match.results?.find((r) => r.team_id === team1?.id)?.score;
    const score2 = match.results?.find((r) => r.team_id === team2?.id)?.score;
    const winnerId = match.results?.reduce((max, r) => r.score > (max?.score || 0) ? r : max, match.results[0])?.team_id;

    const isTBD1 = !team1;
    const isTBD2 = !team2;

    // Determine if winner (simple check: higher score and finished)
    const isWinner1 = match.status === 'finished' && score1 !== undefined && score2 !== undefined && score1 > score2;
    const isWinner2 = match.status === 'finished' && score1 !== undefined && score2 !== undefined && score2 > score1;

    return (
        <div className="w-64 flex-shrink-0">
            <Link href={`/match/${match.id}`} className="block bg-card border border-card-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                {/* Header / Date */}
                <div className="bg-secondary/30 px-3 py-1.5 text-[10px] text-muted-foreground flex justify-between items-center border-b border-card-border">
                    <span>{match.status === 'running' ? 'LIVE' : match.begin_at ? new Date(match.begin_at).toLocaleDateString() : 'TBD'}</span>
                    {match.status === 'running' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                </div>

                {/* Team 1 */}
                <div className={`flex items-center justify-between px-3 py-2 border-b border-card-border/50 ${isWinner1 ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        {team1?.image_url ? (
                            <Image src={team1.image_url} alt={team1.name} width={20} height={20} className="object-contain" />
                        ) : (
                            <div className="w-5 h-5 bg-secondary rounded flex items-center justify-center text-[10px] text-muted-foreground">?</div>
                        )}
                        <span className={`text-sm truncate font-medium ${isWinner1 ? 'text-primary' : 'text-foreground'}`}>
                            {team1?.name || "TBD"}
                        </span>
                    </div>
                    <span className="font-mono text-sm font-bold">{score1 ?? "-"}</span>
                </div>

                {/* Team 2 */}
                <div className={`flex items-center justify-between px-3 py-2 ${isWinner2 ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        {team2?.image_url ? (
                            <Image src={team2.image_url} alt={team2.name} width={20} height={20} className="object-contain" />
                        ) : (
                            <div className="w-5 h-5 bg-secondary rounded flex items-center justify-center text-[10px] text-muted-foreground">?</div>
                        )}
                        <span className={`text-sm truncate font-medium ${isWinner2 ? 'text-primary' : 'text-foreground'}`}>
                            {team2?.name || "TBD"}
                        </span>
                    </div>
                    <span className="font-mono text-sm font-bold">{score2 ?? "-"}</span>
                </div>
            </Link>
        </div>
    );
}

export function BracketView({ matches }: BracketViewProps) {
    const sections = useMemo(() => parseBracketMatches(matches), [matches]);

    if (sections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-card-border rounded-xl">
                <Trophy className="w-12 h-12 mb-4 opacity-20" />
                <p>Bracket structure could not be determined.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 py-8 overflow-x-auto">
            {sections.map((section) => (
                <div key={section.id} className="min-w-max">
                    {sections.length > 1 && (
                        <h3 className="text-xl font-display font-bold mb-6 px-4 uppercase tracking-widest text-muted-foreground border-l-4 border-primary pl-4">
                            {section.name}
                        </h3>
                    )}

                    <div className="flex gap-12 px-4">
                        {section.rounds.map((round) => (
                            <div key={round.id} className="flex flex-col gap-6">
                                <div className="text-center font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">
                                    {round.name}
                                </div>
                                <div className="flex flex-col justify-around h-full gap-4">
                                    {round.matches.map((match) => (
                                        <BracketMatchCard key={match.id} match={match} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
