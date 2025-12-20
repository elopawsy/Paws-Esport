/**
 * Advanced Odds Calculator
 * 
 * Core calculation engine for multi-game betting odds.
 * Uses Elo-style probability formula with multiple factors.
 */

import type { OddsFactors, OddsResult, OddsConfidence } from './types';
import {
    FACTOR_WEIGHTS,
    calculateH2HAdvantage,
    calculateTierBonus,
    calculateVolatilityFactor,
    getOddsLabel,
} from './factors';

/**
 * Main odds calculation function
 * 
 * Combines all factors to produce accurate odds for a match.
 */
export function calculateAdvancedOdds(factors: OddsFactors): OddsResult {
    const {
        team1,
        team2,
        h2h,
        tournamentTier,
        matchFormat,
    } = factors;

    // 1. Base strength (normalized form scores)
    const team1BaseStrength = team1.formScore;
    const team2BaseStrength = team2.formScore;

    // 2. H2H advantage
    const h2hAdvantage = calculateH2HAdvantage(h2h, team1.teamId, team2.teamId);

    // 3. Tournament tier bonus (applied equally, affects volatility expectation)
    const tierBonus = calculateTierBonus(tournamentTier);

    // 4. Volatility factor from match format
    const volatilityFactor = calculateVolatilityFactor(matchFormat);

    // 5. Calculate final strength scores
    const team1Strength = calculateFinalStrength(
        team1BaseStrength,
        h2hAdvantage,
        tierBonus,
        true // is team1
    );

    const team2Strength = calculateFinalStrength(
        team2BaseStrength,
        -h2hAdvantage, // Inverted for team2
        tierBonus,
        false // is team2
    );

    // 6. Calculate win probabilities using Elo formula
    const rawProbability1 = calculateWinProbability(team1Strength, team2Strength);

    // 7. Apply volatility adjustment
    const adjustedProbability1 = applyVolatility(rawProbability1, volatilityFactor);
    const adjustedProbability2 = 1 - adjustedProbability1;

    // 8. Convert to decimal odds with bookmaker margin
    const team1Odds = probabilityToOdds(adjustedProbability1);
    const team2Odds = probabilityToOdds(adjustedProbability2);

    // 9. Determine confidence level
    const confidence = calculateConfidence(factors);

    return {
        team1Odds,
        team2Odds,
        team1Probability: adjustedProbability1,
        team2Probability: adjustedProbability2,
        confidence,
        factors: {
            team1FormScore: team1.formScore,
            team2FormScore: team2.formScore,
            h2hAdvantage,
            tierBonus,
            volatilityFactor,
        },
    };
}

/**
 * Calculate final strength score for a team
 */
function calculateFinalStrength(
    baseStrength: number,
    h2hAdvantage: number,
    tierBonus: number,
    isTeam1: boolean
): number {
    // Position bonus: small advantage for team listed first (home team equivalent)
    const positionBonus = isTeam1 ? 3 : 0;

    // Weighted combination
    const strength =
        baseStrength * FACTOR_WEIGHTS.RECENT_FORM +
        (50 + h2hAdvantage) * FACTOR_WEIGHTS.HEAD_TO_HEAD + // Normalize H2H to 0-100
        (50 + tierBonus) * FACTOR_WEIGHTS.TOURNAMENT_TIER + // Normalize tier to 0-100
        positionBonus * 10 * FACTOR_WEIGHTS.POSITION_BONUS; // Small position bonus

    return strength;
}

/**
 * Calculate win probability using Elo-style formula
 */
function calculateWinProbability(strength1: number, strength2: number): number {
    // Elo formula: E = 1 / (1 + 10^((R2 - R1) / 400))
    // Using scale factor of 40 for our 0-100 strength scores
    const exponent = (strength2 - strength1) / 40;
    return 1 / (1 + Math.pow(10, exponent));
}

/**
 * Apply volatility adjustment to probability
 * 
 * For high volatility (BO1), push odds toward 50/50
 * For low volatility (BO5), let favorites have bigger edge
 */
function applyVolatility(probability: number, volatilityFactor: number): number {
    // Calculate how far from 50% we are
    const distanceFrom50 = probability - 0.5;

    // Apply volatility factor to this distance
    const adjustedDistance = distanceFrom50 * volatilityFactor;

    // Return adjusted probability, clamped to valid range
    return Math.max(0.05, Math.min(0.95, 0.5 + adjustedDistance));
}

/**
 * Convert win probability to decimal odds with bookmaker margin
 */
function probabilityToOdds(probability: number): number {
    // Ensure probability is within valid bounds
    const p = Math.max(0.05, Math.min(0.95, probability));

    // Calculate fair odds
    const fairOdds = 1 / p;

    // Apply 5% bookmaker margin (makes odds slightly worse for bettors)
    const marginOdds = fairOdds * 0.95;

    // Round to 2 decimals, minimum 1.05
    return Math.max(1.05, Math.round(marginOdds * 100) / 100);
}

/**
 * Calculate confidence level based on data quality
 */
function calculateConfidence(factors: OddsFactors): OddsConfidence {
    const team1MatchCount = factors.team1.recentMatches.length;
    const team2MatchCount = factors.team2.recentMatches.length;
    const h2hCount = factors.h2h.length;

    // High confidence: Both teams have 5+ recent matches and 2+ H2H
    if (team1MatchCount >= 5 && team2MatchCount >= 5 && h2hCount >= 2) {
        return 'high';
    }

    // Medium confidence: Both teams have 3+ recent matches OR 1+ H2H
    if ((team1MatchCount >= 3 && team2MatchCount >= 3) || h2hCount >= 1) {
        return 'medium';
    }

    // Low confidence: Limited data
    return 'low';
}

/**
 * Simple odds calculation (backward compatible with existing code)
 * 
 * Uses only tier and basic form info when full data not available.
 */
export function calculateSimpleOdds(
    tournamentTier: string | null,
    team1RecentWins: number = 0,
    team2RecentWins: number = 0,
    matchFormat: number = 3
): { team1Odds: number; team2Odds: number } {
    // Create minimal factors
    const team1FormScore = 50 + (team1RecentWins * 10); // 0-5 wins = 50-100
    const team2FormScore = 50 + (team2RecentWins * 10);

    const tierBonus = calculateTierBonus(tournamentTier);
    const volatilityFactor = calculateVolatilityFactor(matchFormat);

    // Simple strength calculation
    const team1Strength = team1FormScore + tierBonus + 3; // Small home advantage
    const team2Strength = team2FormScore;

    // Calculate probabilities
    const rawProb1 = calculateWinProbability(team1Strength, team2Strength);
    const adjustedProb1 = applyVolatility(rawProb1, volatilityFactor);

    return {
        team1Odds: probabilityToOdds(adjustedProb1),
        team2Odds: probabilityToOdds(1 - adjustedProb1),
    };
}

// Re-export utility functions for external use
export { getOddsLabel, formatOdds } from './factors';
