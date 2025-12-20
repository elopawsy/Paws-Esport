/**
 * Odds Service
 * 
 * Service layer to fetch team data and calculate odds.
 * Uses free PandaScore endpoints for recent form and H2H data.
 */

import { apiClient } from '@/infrastructure/pandascore/ApiClient';
import { isSDKConfigured } from '@/infrastructure/pandascore';
import { getApiSlug } from '@/infrastructure/pandascore/gameSlugMapper';
import type { VideoGameSlug } from '@/types/videogame';
import type {
    RecentMatchResult,
    H2HRecord,
    OddsFactors,
    OddsResult,
    MatchOddsInput,
    SimpleOddsResult,
} from '@/lib/odds/types';
import {
    calculateAdvancedOdds,
    calculateSimpleOdds,
    buildTeamOddsData,
    getOddsLabel,
} from '@/lib/odds';

// Cache for recent form data (5 minutes)
const formCache = new Map<string, { data: RecentMatchResult[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Get recent match results for a team
 */
async function getTeamRecentForm(
    teamId: number,
    videogame: VideoGameSlug,
    limit: number = 5
): Promise<RecentMatchResult[]> {
    const cacheKey = `form-${teamId}-${videogame}`;
    const cached = formCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    if (!isSDKConfigured()) {
        return [];
    }

    try {
        const gameSlug = getApiSlug(videogame);
        const response = await apiClient.getTeamMatches(teamId, {
            'filter[status]': 'finished',
            'sort': '-scheduled_at',
            'page[size]': limit.toString(),
        });

        const matches = response.data || [];

        const results: RecentMatchResult[] = matches.map((match: any) => {
            // Find if this team won
            const winnerId = match.winner_id;
            const won = winnerId === teamId;

            // Find opponent
            const opponents = match.opponents || [];
            const opponent = opponents.find((op: any) => op.opponent?.id !== teamId)?.opponent;
            const opponentId = opponent?.id || 0;
            const opponentName = opponent?.name || 'Unknown';

            // Get tournament tier
            const tournamentTier = match.tournament?.tier || null;

            return {
                matchId: match.id,
                won,
                opponentId,
                opponentName,
                tournamentTier,
                scheduledAt: match.scheduled_at,
            };
        });

        // Cache the results
        formCache.set(cacheKey, { data: results, timestamp: Date.now() });

        return results;
    } catch (error) {
        console.error(`Failed to fetch recent form for team ${teamId}:`, error);
        return [];
    }
}

/**
 * Get head-to-head history between two teams
 */
async function getHeadToHead(
    team1Id: number,
    team2Id: number,
    videogame: VideoGameSlug,
    limit: number = 5
): Promise<H2HRecord[]> {
    const cacheKey = `h2h-${Math.min(team1Id, team2Id)}-${Math.max(team1Id, team2Id)}-${videogame}`;
    const cached = formCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data as unknown as H2HRecord[];
    }

    if (!isSDKConfigured()) {
        return [];
    }

    try {
        const gameSlug = getApiSlug(videogame);

        // Fetch past matches for team1 and filter for matches against team2
        const response = await apiClient.getTeamMatches(team1Id, {
            'filter[status]': 'finished',
            'sort': '-scheduled_at',
            'page[size]': '20', // Fetch more to find H2H matches
        });

        const matches = response.data || [];

        // Filter matches that include both teams
        const h2hMatches = matches.filter((match: any) => {
            const opponentIds = (match.opponents || []).map((op: any) => op.opponent?.id);
            return opponentIds.includes(team1Id) && opponentIds.includes(team2Id);
        });

        const results: H2HRecord[] = h2hMatches.slice(0, limit).map((match: any) => {
            const results = match.results || [];
            const team1Result = results.find((r: any) => r.team_id === team1Id);
            const team2Result = results.find((r: any) => r.team_id === team2Id);

            return {
                matchId: match.id,
                winnerId: match.winner_id,
                team1Score: team1Result?.score || 0,
                team2Score: team2Result?.score || 0,
                scheduledAt: match.scheduled_at,
                tournamentName: match.tournament?.name || null,
            };
        });

        // Cache the results (using the same cache but different key format)
        formCache.set(cacheKey, { data: results as unknown as RecentMatchResult[], timestamp: Date.now() });

        return results;
    } catch (error) {
        console.error(`Failed to fetch H2H for teams ${team1Id} vs ${team2Id}:`, error);
        return [];
    }
}

/**
 * Calculate odds for a specific match with full data
 */
export async function getOddsForMatch(input: MatchOddsInput): Promise<OddsResult> {
    const {
        team1Id,
        team2Id,
        team1Name,
        team2Name,
        tournamentTier,
        matchFormat,
        videogame,
    } = input;

    // Fetch all data in parallel
    const [team1Form, team2Form, h2h] = await Promise.all([
        getTeamRecentForm(team1Id, videogame),
        getTeamRecentForm(team2Id, videogame),
        getHeadToHead(team1Id, team2Id, videogame),
    ]);

    // Build team data
    const team1Data = buildTeamOddsData(team1Id, team1Name, team1Form);
    const team2Data = buildTeamOddsData(team2Id, team2Name, team2Form);

    // Count H2H wins
    const h2hTeam1Wins = h2h.filter(r => r.winnerId === team1Id).length;
    const h2hTeam2Wins = h2h.filter(r => r.winnerId === team2Id).length;

    // Build factors
    const factors: OddsFactors = {
        team1: team1Data,
        team2: team2Data,
        h2h,
        h2hTeam1Wins,
        h2hTeam2Wins,
        tournamentTier,
        matchFormat,
        videogame,
    };

    // Calculate odds
    return calculateAdvancedOdds(factors);
}

/**
 * Get simple odds result with labels (for API responses)
 */
export async function getSimpleOddsForMatch(input: MatchOddsInput): Promise<SimpleOddsResult> {
    const result = await getOddsForMatch(input);

    return {
        team1Odds: result.team1Odds,
        team2Odds: result.team2Odds,
        team1Label: getOddsLabel(result.team1Odds),
        team2Label: getOddsLabel(result.team2Odds),
        confidence: result.confidence,
    };
}

/**
 * Quick odds calculation without fetching data
 * Uses only provided parameters (backward compatible)
 */
export function getQuickOdds(
    tournamentTier: string | null,
    team1RecentWins: number = 0,
    team2RecentWins: number = 0,
    matchFormat: number = 3
): { team1Odds: number; team2Odds: number } {
    return calculateSimpleOdds(tournamentTier, team1RecentWins, team2RecentWins, matchFormat);
}

/**
 * Odds Service object for convenience
 */
export const OddsService = {
    getOddsForMatch,
    getSimpleOddsForMatch,
    getQuickOdds,
    getTeamRecentForm,
    getHeadToHead,
};
