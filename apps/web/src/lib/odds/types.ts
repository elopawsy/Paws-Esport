/**
 * Odds Calculator Type Definitions
 * 
 * Types for the multi-game odds calculation system.
 */

import type { VideoGameSlug } from '@/types/videogame';

/**
 * Recent match result for form calculation
 */
export interface RecentMatchResult {
    matchId: number;
    won: boolean;
    opponentId: number;
    opponentName: string;
    tournamentTier: string | null;
    scheduledAt: string | null;
}

/**
 * Head-to-head match record
 */
export interface H2HRecord {
    matchId: number;
    winnerId: number | null;
    team1Score: number;
    team2Score: number;
    scheduledAt: string | null;
    tournamentName: string | null;
}

/**
 * Team data for odds calculation
 */
export interface TeamOddsData {
    teamId: number;
    teamName: string;
    recentMatches: RecentMatchResult[];
    // Calculated values
    recentWins: number;
    recentLosses: number;
    formScore: number; // 0-100
}

/**
 * Input factors for odds calculation
 */
export interface OddsFactors {
    team1: TeamOddsData;
    team2: TeamOddsData;
    h2h: H2HRecord[];
    h2hTeam1Wins: number;
    h2hTeam2Wins: number;
    tournamentTier: string | null; // s, a, b, c, d
    matchFormat: number; // 1, 3, or 5 (BO1, BO3, BO5)
    videogame: VideoGameSlug;
}

/**
 * Confidence level for the odds calculation
 */
export type OddsConfidence = 'high' | 'medium' | 'low';

/**
 * Result of odds calculation
 */
export interface OddsResult {
    team1Odds: number;
    team2Odds: number;
    team1Probability: number;
    team2Probability: number;
    confidence: OddsConfidence;
    factors: {
        team1FormScore: number;
        team2FormScore: number;
        h2hAdvantage: number; // positive = team1 advantage
        tierBonus: number;
        volatilityFactor: number;
    };
}

/**
 * Input for calculating odds for a specific match
 */
export interface MatchOddsInput {
    matchId: number;
    team1Id: number;
    team2Id: number;
    team1Name: string;
    team2Name: string;
    tournamentTier: string | null;
    matchFormat: number;
    videogame: VideoGameSlug;
}

/**
 * Simplified odds result for API responses
 */
export interface SimpleOddsResult {
    team1Odds: number;
    team2Odds: number;
    team1Label: string;
    team2Label: string;
    confidence: OddsConfidence;
}
