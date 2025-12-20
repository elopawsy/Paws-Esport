/**
 * Odds Calculator - Legacy Entry Point
 * 
 * This file re-exports from the new modular odds system.
 * Maintained for backward compatibility with existing imports.
 * 
 * @deprecated Import from '@/lib/odds' directory instead for new code
 */

// Re-export everything from the new modular system
export * from './odds/index';

// Legacy type (some old code might use this directly)
export interface OddsResult {
    team1Odds: number;
    team2Odds: number;
}

/**
 * Legacy calculateOdds function
 * 
 * @deprecated Use calculateSimpleOdds or calculateAdvancedOdds instead
 */
export function calculateOdds(
    matchTier: string | null,
    tournamentTier: string | null,
    team1RecentWins: number = 0,
    team2RecentWins: number = 0
): OddsResult {
    // Import and use the new function
    const { calculateSimpleOdds } = require('./odds/calculator');

    // Determine effective tier from matchTier if tournamentTier not provided
    let effectiveTier = tournamentTier;
    if (!effectiveTier && matchTier) {
        if (matchTier.toLowerCase().includes('tier 1')) {
            effectiveTier = 's';
        } else if (matchTier.toLowerCase().includes('tier 2')) {
            effectiveTier = 'a';
        } else {
            effectiveTier = 'b';
        }
    }

    return calculateSimpleOdds(effectiveTier, team1RecentWins, team2RecentWins, 3);
}
