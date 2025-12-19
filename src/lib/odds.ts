/**
 * Dynamic Odds Calculator
 * 
 * Calculates betting odds based on:
 * - Tournament tier (S, A, B, C, D)
 * - Team rankings (approximated from match tier)
 */

export interface OddsResult {
    team1Odds: number;
    team2Odds: number;
}

/**
 * Approximate team strength from 0-100 based on tier
 * Tier S/A teams = 70-100
 * Tier B teams = 50-70
 * Tier C/D teams = 30-50
 * Unknown = 50
 * 
 * Uses deterministic offset for team1/team2 to create asymmetry
 */
function getTeamStrength(tier: string | null, isTeam1: boolean): number {
    // Deterministic offset: team1 gets slight advantage
    const offset = isTeam1 ? 3 : -3;

    switch (tier?.toLowerCase()) {
        case 's':
            return 85 + offset;
        case 'a':
            return 75 + offset;
        case 'b':
            return 60 + offset;
        case 'c':
            return 45 + offset;
        case 'd':
            return 35 + offset;
        default:
            return 50 + offset;
    }
}

/**
 * Calculate odds from win probability
 * Standard bookmaker margin of ~5% applied
 */
function probabilityToOdds(probability: number): number {
    // Ensure probability is within bounds
    const p = Math.max(0.1, Math.min(0.9, probability));

    // Calculate fair odds
    const fairOdds = 1 / p;

    // Apply slight margin (5%)
    const marginOdds = fairOdds * 0.95;

    // Round to 2 decimals, minimum 1.10
    return Math.max(1.10, Math.round(marginOdds * 100) / 100);
}

/**
 * Calculate dynamic odds for a match
 * 
 * @param matchTier - The match tier (e.g., "Tier 1", "Tier 2")
 * @param tournamentTier - Tournament tier letter (s, a, b, c, d)
 * @param team1RecentWins - Optional: team 1 recent wins count (0-5)
 * @param team2RecentWins - Optional: team 2 recent wins count (0-5)
 */
export function calculateOdds(
    matchTier: string | null,
    tournamentTier: string | null,
    team1RecentWins: number = 0,
    team2RecentWins: number = 0
): OddsResult {
    // Determine effective tier
    let effectiveTier = tournamentTier;
    if (!effectiveTier && matchTier) {
        // Map match tier to tournament tier
        if (matchTier.toLowerCase().includes('tier 1')) {
            effectiveTier = 's';
        } else if (matchTier.toLowerCase().includes('tier 2')) {
            effectiveTier = 'a';
        } else {
            effectiveTier = 'b';
        }
    }

    // Get base team strengths
    let team1Strength = getTeamStrength(effectiveTier, true);
    let team2Strength = getTeamStrength(effectiveTier, false);

    // Adjust for recent form (each recent win adds 2 points)
    team1Strength += Math.min(5, team1RecentWins) * 2;
    team2Strength += Math.min(5, team2RecentWins) * 2;

    // Calculate win probabilities using Elo-like formula
    const expectedScore1 = 1 / (1 + Math.pow(10, (team2Strength - team1Strength) / 40));
    const expectedScore2 = 1 - expectedScore1;

    // Convert to odds
    const team1Odds = probabilityToOdds(expectedScore1);
    const team2Odds = probabilityToOdds(expectedScore2);

    return { team1Odds, team2Odds };
}

/**
 * Get descriptive label for odds
 */
export function getOddsLabel(odds: number): string {
    if (odds < 1.30) return "Grand favori";
    if (odds < 1.60) return "Favori";
    if (odds < 2.00) return "Léger favori";
    if (odds < 2.50) return "Équilibré";
    if (odds < 3.50) return "Outsider";
    return "Gros outsider";
}

/**
 * Format odds for display
 */
export function formatOdds(odds: number): string {
    return `x${odds.toFixed(2)}`;
}
