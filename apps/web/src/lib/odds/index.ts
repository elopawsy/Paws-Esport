/**
 * Odds Calculator - Barrel Export
 * 
 * Central export point for the odds calculation system.
 */

// Types
export type {
    OddsFactors,
    OddsResult,
    OddsConfidence,
    TeamOddsData,
    MatchOddsInput,
    SimpleOddsResult,
    RecentMatchResult,
    H2HRecord,
} from './types';

// Calculator functions
export {
    calculateAdvancedOdds,
    calculateSimpleOdds,
    getOddsLabel,
    formatOdds,
} from './calculator';

// Factor helpers
export {
    FACTOR_WEIGHTS,
    calculateFormScore,
    calculateH2HAdvantage,
    calculateTierBonus,
    calculateVolatilityFactor,
    buildTeamOddsData,
} from './factors';
