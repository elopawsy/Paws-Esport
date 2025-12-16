
"use client";

import type { Match } from "@/types";
import { parseBracketMatches, BracketSection, BracketRound } from "@/lib/bracket-parser";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface BracketViewProps {
    matches: Match[];
}

// Fixed dimensions for pixel-perfect alignment
const MATCH_HEIGHT = 90; // Fixed card height
const GAP_SIZE = 32;     // Base gap between matches in Round 1

function BracketMatchCard({ match, isWinner, hasLineRight, lineType }: { match: Match; isWinner?: boolean; hasLineRight?: boolean; lineType?: 'top' | 'bottom' | 'single' }) {
    const team1 = match.opponents[0]?.opponent;
    const team2 = match.opponents[1]?.opponent;
    const score1 = match.results?.find((r) => r.team_id === team1?.id)?.score;
    const score2 = match.results?.find((r) => r.team_id === team2?.id)?.score;

    const isWinner1 = match.status === 'finished' && score1 !== undefined && score2 !== undefined && score1 > score2;
    const isWinner2 = match.status === 'finished' && score1 !== undefined && score2 !== undefined && score2 > score1;

    return (
        <div
            className={cn("w-64 flex-shrink-0 relative z-10 box-border", isWinner && "ring-2 ring-primary/50 rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.3)]")}
            style={{ height: MATCH_HEIGHT }}
        >
            <Link href={`/match/${match.id}`} className="block h-full bg-card border border-card-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors flex flex-col">
                {/* Header */}
                <div className="bg-secondary/30 px-3 py-1 text-[10px] text-muted-foreground flex justify-between items-center border-b border-card-border h-[26px]">
                    <span>{match.status === 'running' ? 'LIVE' : match.begin_at ? new Date(match.begin_at).toLocaleDateString() : 'TBD'}</span>
                    {match.status === 'running' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                </div>

                {/* Team 1 */}
                <div className={cn("flex items-center justify-between px-3 h-[32px] border-b border-card-border/50", isWinner1 && "bg-primary/5")}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        {team1?.image_url ? (
                            <Image src={team1.image_url} alt={team1.name} width={20} height={20} className="object-contain" />
                        ) : (
                            <div className="w-5 h-5 bg-secondary rounded flex items-center justify-center text-[10px] text-muted-foreground">?</div>
                        )}
                        <span className={cn("text-xs truncate font-medium", isWinner1 ? "text-primary" : "text-foreground")}>
                            {team1?.name || "TBD"}
                        </span>
                    </div>
                    <span className="font-mono text-xs font-bold">{score1 ?? "-"}</span>
                </div>

                {/* Team 2 */}
                <div className={cn("flex items-center justify-between px-3 h-[32px]", isWinner2 && "bg-primary/5")}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        {team2?.image_url ? (
                            <Image src={team2.image_url} alt={team2.name} width={20} height={20} className="object-contain" />
                        ) : (
                            <div className="w-5 h-5 bg-secondary rounded flex items-center justify-center text-[10px] text-muted-foreground">?</div>
                        )}
                        <span className={cn("text-xs truncate font-medium", isWinner2 ? "text-primary" : "text-foreground")}>
                            {team2?.name || "TBD"}
                        </span>
                    </div>
                    <span className="font-mono text-xs font-bold">{score2 ?? "-"}</span>
                </div>
            </Link>

            {/* Bracket Connector Lines */}
            {lineType === 'top' && (
                <div className="absolute right-[-24px] top-1/2 h-[calc(50%+16px)] w-[24px] border-r-2 border-b-2 border-card-border rounded-br-none pointer-events-none"
                    style={{ height: `calc(50% + ${(GAP_SIZE + MATCH_HEIGHT) / 2}px)` }} // This is dynamic based on gap actually? No, local pair.
                // Wait, inside a Pair, the gap is managed by the Column logic?
                // The logic here assumes `lineType='top'` is for the UPPER match of a pair.
                // The connector should go DOWN to the midpoint.
                // Midpoint is center of the gap between this card and the next card.
                // Distance to center = Card/2 + Gap/2.
                // So height = 50% (half card) + Gap/2.
                // This requires knowing the gap. The gap passed to the column?
                // Standard Gap is GAP_SIZE? In Round 1 yes. In Round 2 it's bigger.
                // This component doesn't know the gap.
                // We should render lines in the Column component instead of inside the card to use calculated heights.
                />
            )}
        </div>
    );
}

function BracketRoundColumn({ round, roundIndex, isLast, isFirst }: { round: BracketRound; roundIndex: number; isLast: boolean; isFirst: boolean }) {
    // Math for Layout
    // Gap increases geometrically: 32, 32*2+H, ...
    // Gap_R = (MATCH_HEIGHT + GAP_SIZE) * 2^R - MATCH_HEIGHT
    const gap = (MATCH_HEIGHT + GAP_SIZE) * Math.pow(2, roundIndex) - MATCH_HEIGHT;

    // Top Offset to center properly
    // Offset_R = (MATCH_HEIGHT + GAP_SIZE) * (2^(R) / 2 - 0.5)
    // R=0 -> 0.
    // R=1 -> (H+G) * (1 - 0.5) = 0.5(H+G).
    const topOffset = (MATCH_HEIGHT + GAP_SIZE) * (Math.pow(2, roundIndex) / 2 - 0.5);

    // Connector Line Heights
    // The vertical connector connects R-M1 to R-M2.
    // Length = Gap + MATCH_HEIGHT.
    // Midpoint to midpoint.
    // It should be drawn relative to the first match of the pair?
    // Let's draw it as an absolute overlay in the column.

    return (
        <div
            className="flex flex-col"
            style={{
                rowGap: `${gap}px`,
                paddingTop: `${topOffset}px`
            }}
        >
            {round.matches.map((match, idx) => {
                // Determine pairing for lines
                // If even index (0, 2, 4...), it's the Top of a pair (unless last round or single)
                const isEven = idx % 2 === 0;
                const pairId = Math.floor(idx / 2);
                const isPairStart = isEven && !isLast && (idx + 1 < round.matches.length);
                const isPairEnd = !isEven && !isLast;

                // Height of the connector arm
                // For Top Item: From Center (approx 50%) DOWN to local midpoint.
                // Local Midpoint is Offset + Height + Gap/2.
                // Distance = Gap/2 + MATCH_HEIGHT/2.
                const armHeight = gap / 2 + MATCH_HEIGHT / 2;

                return (
                    <div key={match.id} className="relative">
                        {/* Input Line (Left) */}
                        {!isFirst && (
                            <div className="absolute -left-6 top-1/2 w-6 h-[2px] bg-card-border" />
                        )}

                        <BracketMatchCard match={match} isWinner={isLast} />

                        {/* Output Connectors (Right) - Computed in Column Loop for correctness */}
                        {!isLast && (
                            <>
                                {/* Horizontal Stub leaving the card */}
                                <div className="absolute -right-6 top-1/2 w-6 h-[2px] bg-card-border" />

                                {/* Vertical Arms */}
                                {isPairStart && (
                                    <div
                                        className="absolute right-[-24px] top-1/2 w-[2px] bg-card-border"
                                        style={{ height: `${armHeight}px` }}
                                    />
                                )}
                                {isPairEnd && (
                                    <div
                                        className="absolute right-[-24px] bottom-1/2 w-[2px] bg-card-border"
                                        style={{ height: `${armHeight}px` }}
                                    />
                                )}

                                {/* Spur to Next Round (Only on Pair Start/Top usually, aligned to center of pair) */}
                                {/* Wait, the spur needs to be at the exact midpoint of the pair.
                                    The "pair center" is at the bottom of the Top Arm (which is at top + armHeight).
                                    So we can attach the spur to the Top Item's arm bottom.
                                */}
                                {isPairStart && (
                                    <div
                                        className="absolute right-[-48px] h-[2px] bg-card-border w-6"
                                        style={{ top: `calc(50% + ${armHeight}px)` }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                );
            })}
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
        <div className="space-y-12 py-8 overflow-x-auto pb-16">
            {sections.map((section) => (
                <div key={section.id} className="min-w-max">
                    {sections.length > 1 && (
                        <h3 className="text-xl font-display font-bold mb-6 px-4 uppercase tracking-widest text-muted-foreground border-l-4 border-primary pl-4">
                            {section.name}
                        </h3>
                    )}

                    <div className="flex px-4" style={{ columnGap: '48px' }}> {/* Fixed column gap for spurs */}
                        {section.rounds.map((round, idx) => (
                            <div key={round.id} className="flex flex-col gap-6 w-64">
                                <div className="text-center font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 border-b border-card-border/50 pb-2">
                                    {round.name}
                                </div>
                                <BracketRoundColumn
                                    round={round}
                                    roundIndex={idx}
                                    isFirst={idx === 0}
                                    isLast={idx === section.rounds.length - 1}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
