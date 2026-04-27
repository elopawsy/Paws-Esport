/**
 * Game Types - CS2/CSGO specific
 * 
 * Types for game (map) details and player statistics from PandaScore API.
 */

/**
 * Player statistics for a single game (map)
 */
export interface GamePlayerStats {
    player: {
        id: number;
        name: string;
        first_name: string | null;
        last_name: string | null;
        nationality: string | null;
        image_url: string | null;
    };
    team: {
        id: number;
        name: string;
        acronym: string | null;
    };
    kills: number;
    deaths: number;
    assists: number;
    headshots: number;
    adr: number; // Average Damage per Round
    kast: number; // % of rounds with Kill/Assist/Survive/Trade
    rating: number;
    first_kills_diff: number;
    flash_assists: number;
}

/**
 * Round information for a game
 */
export interface GameRound {
    id: number;
    round: number;
    outcome: string;
    winner_side: 'ct' | 't';
    winner_team: {
        id: number;
        name: string;
    } | null;
    ct_team: {
        id: number;
        score: number;
    };
    t_team: {
        id: number;
        score: number;
    };
}

/**
 * Team scores in a game
 */
export interface GameTeamScore {
    team_id: number;
    team_name: string;
    team_acronym: string | null;
    score: number;
    first_half_score: number;
    second_half_score: number;
    overtime_score: number;
}

/**
 * Detailed game (map) information
 */
export interface GameDetail {
    id: number;
    position: number;
    status: 'not_started' | 'running' | 'finished';
    length: number | null;
    finished: boolean;
    complete: boolean;
    map: {
        id: number;
        name: string;
        image_url: string | null;
    } | null;
    winner: {
        id: number;
        type: 'Team';
    } | null;
    teams: GameTeamScore[];
    players: GamePlayerStats[];
    rounds: GameRound[];
}

/**
 * Basic game info (as returned in match.games array)
 */
export interface GameBasic {
    id: number;
    position: number;
    status: string;
    length: number | null;
    finished: boolean;
    winner: { id: number; type: string } | null;
}

/**
 * Match with enriched game stats
 */
export interface MatchWithGameStats {
    gamesWithStats: GameDetail[];
}
