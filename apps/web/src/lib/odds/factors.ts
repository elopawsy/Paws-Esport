/**
 * Odds Factor Calculation Helpers
 * 
 * Helper functions to calculate each factor used in odds calculation.
 */

import type { RecentMatchResult, H2HRecord, TeamOddsData } from './types';

/**
 * Factor weights for odds calculation
 * These sum to 1.0 (100%)
 */
export const FACTOR_WEIGHTS = {
    RECENT_FORM: 0.35,    // 35% - Last 5 matches
    HEAD_TO_HEAD: 0.20,   // 20% - Historical matchups
    TOURNAMENT_TIER: 0.20, // 20% - Importance of tournament
    MATCH_FORMAT: 0.15,   // 15% - BO1 vs BO3 vs BO5
    POSITION_BONUS: 0.10, // 10% - Team listed first
} as const;

/**
 * Calculate form score from recent matches (0-100)
 * 
 * Scoring:
 * - Win = +20 points (max 5 wins = 100)
 * - Loss = 0 points
 * - Recent matches weighted more heavily
 * - Tier S/A opponents give bonus points for wins
 */
export function calculateFormScore(matches: RecentMatchResult[]): number {
    if (matches.length === 0) return 50; // Neutral if no data

    let score = 0;
    const recentMatches = matches.slice(0, 5); // Only last 5 matches

    recentMatches.forEach((match, index) => {
        // Recency weight: more recent = higher weight
        const recencyWeight = 1 - (index * 0.1); // 1.0, 0.9, 0.8, 0.7, 0.6

        if (match.won) {
            let basePoints = 20;

            // Bonus for beating high-tier opponents
            if (match.tournamentTier === 's' || match.tournamentTier === 'a') {
                basePoints += 5;
            }

            score += basePoints * recencyWeight;
        }
    });

    // Normalize to 0-100, with minimum of 10
    return Math.max(10, Math.min(100, score));
}

/**
 * Calculate head-to-head advantage score (-50 to +50)
 * 
 * Positive = Team 1 has advantage
 * Negative = Team 2 has advantage
 * 0 = Even or no data
 */
export function calculateH2HAdvantage(
    h2hRecords: H2HRecord[],
    team1Id: number,
    team2Id: number
): number {
    if (h2hRecords.length === 0) return 0;

    let team1Wins = 0;
    let team2Wins = 0;

    h2hRecords.forEach((record, index) => {
        // Recency weight for H2H as well
        const recencyWeight = 1 - (index * 0.1);

        if (record.winnerId === team1Id) {
            team1Wins += recencyWeight;
        } else if (record.winnerId === team2Id) {
            team2Wins += recencyWeight;
        }
    });

    const total = team1Wins + team2Wins;
    if (total === 0) return 0;

    // Calculate advantage as percentage difference, scaled to -50 to +50
    const advantageRatio = (team1Wins - team2Wins) / total;
    return advantageRatio * 50;
}

/**
 * Calculate tier bonus for teams in high-tier tournaments
 * 
 * Teams consistently playing in S/A tier tournaments get a slight boost
 */
export function calculateTierBonus(tournamentTier: string | null): number {
    switch (tournamentTier?.toLowerCase()) {
        case 's':
            return 10; // S-tier = slightly better teams generally
        case 'a':
            return 5;
        case 'b':
            return 0;
        case 'c':
            return -5;
        case 'd':
            return -10;
        default:
            return 0;
    }
}

/**
 * Calculate volatility factor based on match format
 * 
 * BO1: High volatility - upsets more likely (push toward 50/50)
 * BO3: Normal volatility
 * BO5: Low volatility - favorites more likely to win
 * 
 * Returns a factor that adjusts how much odds deviate from 50/50
 * Lower = more volatile (closer to 50/50)
 * Higher = less volatile (favorites more likely)
 */
export function calculateVolatilityFactor(matchFormat: number): number {
    switch (matchFormat) {
        case 1: // BO1
            return 0.7; // 30% push toward 50/50
        case 3: // BO3
            return 1.0; // Normal
        case 5: // BO5
            return 1.15; // 15% boost for favorites
        default:
            return 1.0;
    }
}

/**
 * Get descriptive label for odds value
 */
export function getOddsLabel(odds: number): string {
    if (odds < 1.30) return 'Heavy Favorite';
    if (odds < 1.60) return 'Favorite';
    if (odds < 2.00) return 'Slight Favorite';
    if (odds < 2.50) return 'Even Match';
    if (odds < 3.50) return 'Underdog';
    return 'Heavy Underdog';
}

/**
 * Format odds for display
 */
export function formatOdds(odds: number): string {
    return `x${odds.toFixed(2)}`;
}

/**
 * Build TeamOddsData from recent matches
 */
export function buildTeamOddsData(
    teamId: number,
    teamName: string,
    recentMatches: RecentMatchResult[]
): TeamOddsData {
    const wins = recentMatches.filter(m => m.won).length;
    const losses = recentMatches.filter(m => !m.won).length;

    return {
        teamId,
        teamName,
        recentMatches,
        recentWins: wins,
        recentLosses: losses,
        formScore: calculateFormScore(recentMatches),
    };
}
