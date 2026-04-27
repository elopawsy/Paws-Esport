/**
 * Match Odds API Endpoint
 * 
 * Calculate odds for a specific match by fetching team data.
 * GET /api/odds/match/[id]
 */

import { NextResponse } from 'next/server';
import { OddsService } from '@/services/odds.service';
import { MatchService } from '@/services/match.service';
import type { VideoGameSlug } from '@/types/videogame';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const matchId = parseInt(id, 10);

        if (isNaN(matchId)) {
            return NextResponse.json(
                { error: 'Invalid match ID' },
                { status: 400 }
            );
        }

        // Fetch match details to get team info
        const matchDetails = await MatchService.getMatchDetails(id);

        if (!matchDetails) {
            return NextResponse.json(
                { error: 'Match not found' },
                { status: 404 }
            );
        }

        // Extract team info from match
        const opponents = matchDetails.opponents as Array<{
            type: string;
            opponent: { id: number; name: string };
        }>;

        if (!opponents || opponents.length < 2) {
            return NextResponse.json(
                { error: 'Match does not have two opponents' },
                { status: 400 }
            );
        }

        const team1 = opponents[0]?.opponent;
        const team2 = opponents[1]?.opponent;

        if (!team1?.id || !team2?.id) {
            return NextResponse.json(
                { error: 'Invalid team data' },
                { status: 400 }
            );
        }

        // Get tournament tier and match format
        const tournament = matchDetails.tournament as { tier?: string } | null;
        const tournamentTier = tournament?.tier || null;
        const matchFormat = (matchDetails.number_of_games as number) || 3;
        const videogame = (matchDetails.videogame as { slug?: string })?.slug || 'cs-2';

        // Calculate odds
        const odds = await OddsService.getOddsForMatch({
            matchId,
            team1Id: team1.id,
            team2Id: team2.id,
            team1Name: team1.name || 'Team 1',
            team2Name: team2.name || 'Team 2',
            tournamentTier,
            matchFormat,
            videogame: videogame as VideoGameSlug,
        });

        return NextResponse.json({
            matchId,
            team1: {
                id: team1.id,
                name: team1.name,
                odds: odds.team1Odds,
                probability: Math.round(odds.team1Probability * 100),
                formScore: odds.factors.team1FormScore,
            },
            team2: {
                id: team2.id,
                name: team2.name,
                odds: odds.team2Odds,
                probability: Math.round(odds.team2Probability * 100),
                formScore: odds.factors.team2FormScore,
            },
            confidence: odds.confidence,
            factors: {
                h2hAdvantage: odds.factors.h2hAdvantage,
                tierBonus: odds.factors.tierBonus,
                volatilityFactor: odds.factors.volatilityFactor,
            },
        });
    } catch (error) {
        console.error('Error calculating match odds:', error);
        return NextResponse.json(
            { error: 'Failed to calculate odds' },
            { status: 500 }
        );
    }
}
