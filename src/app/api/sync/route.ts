/**
 * Database Sync API Route
 * 
 * Endpoint to trigger automatic synchronization of PandaScore data to database.
 * Supports all videogames and configurable page sizes.
 * Can be called by CRON jobs or manually to keep the database populated.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    syncMatchesToDb,
    syncTeamsToDb,
    syncTournamentsToDb
} from '@/services/db.service';
import { VIDEO_GAMES, type VideoGameSlug } from '@/infrastructure/pandascore/constants';

// Prevent static generation
export const dynamic = 'force-dynamic';

// All available videogame slugs
const ALL_GAMES = Object.keys(VIDEO_GAMES) as VideoGameSlug[];

/**
 * GET /api/sync - Trigger a sync of data
 * Query params:
 *   - type: 'all' | 'matches' | 'teams' | 'tournaments' (default: 'all')
 *   - games: comma-separated list of game slugs (default: all games)
 *   - status: 'running' | 'not_started' | 'finished' (for matches, optional - syncs all by default)
 *   - limit: number of items per page (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const gamesParam = searchParams.get('games');
    const status = searchParams.get('status') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Parse games parameter
    const games: VideoGameSlug[] = gamesParam
        ? gamesParam.split(',').filter(g => ALL_GAMES.includes(g as VideoGameSlug)) as VideoGameSlug[]
        : ALL_GAMES;

    const results: Record<string, { success: boolean; message: string; count: number; games?: string[] }> = {};

    try {
        console.log(`[Sync API] Starting sync for type: ${type}, games: ${games.join(', ')}, limit: ${limit}`);

        if (type === 'all' || type === 'matches') {
            let totalCount = 0;
            const gameResults: string[] = [];

            for (const game of games) {
                if (status) {
                    // Single status sync
                    const result = await syncMatchesToDb(status, game, limit);
                    totalCount += result.count;
                    gameResults.push(`${game}: ${result.count}`);
                } else {
                    // All statuses
                    const running = await syncMatchesToDb('running', game, limit);
                    const upcoming = await syncMatchesToDb('not_started', game, limit);
                    const past = await syncMatchesToDb('finished', game, limit);
                    const gameTotal = running.count + upcoming.count + past.count;
                    totalCount += gameTotal;
                    gameResults.push(`${game}: ${gameTotal}`);
                }
            }

            results.matches = {
                success: true,
                message: gameResults.join(', '),
                count: totalCount,
                games: games,
            };
            console.log(`[Sync API] Matches synced: ${totalCount}`);
        }

        if (type === 'all' || type === 'teams') {
            let totalCount = 0;
            const gameResults: string[] = [];

            for (const game of games) {
                const result = await syncTeamsToDb(game, limit);
                totalCount += result.count;
                gameResults.push(`${game}: ${result.count}`);
            }

            results.teams = {
                success: true,
                message: gameResults.join(', '),
                count: totalCount,
                games: games,
            };
            console.log(`[Sync API] Teams synced: ${totalCount}`);
        }

        if (type === 'all' || type === 'tournaments') {
            let totalCount = 0;
            const gameResults: string[] = [];

            for (const game of games) {
                const result = await syncTournamentsToDb(game, limit);
                totalCount += result.count;
                gameResults.push(`${game}: ${result.count}`);
            }

            results.tournaments = {
                success: true,
                message: gameResults.join(', '),
                count: totalCount,
                games: games,
            };
            console.log(`[Sync API] Tournaments synced: ${totalCount}`);
        }

        const totalCount = Object.values(results).reduce((sum, r) => sum + r.count, 0);

        return NextResponse.json({
            success: true,
            message: `Sync completed successfully for ${games.length} game(s)`,
            syncedAt: new Date().toISOString(),
            gamesProcessed: games,
            totalCount,
            results,
        });
    } catch (error) {
        console.error('[Sync API] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
                results,
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/sync - Trigger sync with body configuration
 * Body: { 
 *   types: ['matches', 'teams', 'tournaments'], 
 *   games: ['cs-2', 'valorant', ...],
 *   matchStatus?: string,
 *   limit?: number 
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const types = body.types || ['all'];
        const games: VideoGameSlug[] = body.games || ALL_GAMES;
        const matchStatus = body.matchStatus;
        const limit = Math.min(body.limit || 50, 100);

        const results: Record<string, { success: boolean; message: string; count: number }> = {};

        console.log(`[Sync API] POST sync for types: ${types.join(', ')}, games: ${games.join(', ')}`);

        for (const type of types) {
            if (type === 'all' || type === 'matches') {
                let totalCount = 0;

                for (const game of games) {
                    if (matchStatus) {
                        const result = await syncMatchesToDb(matchStatus, game, limit);
                        totalCount += result.count;
                    } else {
                        const running = await syncMatchesToDb('running', game, limit);
                        const upcoming = await syncMatchesToDb('not_started', game, limit);
                        const past = await syncMatchesToDb('finished', game, limit);
                        totalCount += running.count + upcoming.count + past.count;
                    }
                }

                results.matches = {
                    success: true,
                    message: `Synced matches for ${games.length} games`,
                    count: totalCount,
                };
            }

            if (type === 'all' || type === 'teams') {
                let totalCount = 0;
                for (const game of games) {
                    const result = await syncTeamsToDb(game, limit);
                    totalCount += result.count;
                }
                results.teams = {
                    success: true,
                    message: `Synced teams for ${games.length} games`,
                    count: totalCount,
                };
            }

            if (type === 'all' || type === 'tournaments') {
                let totalCount = 0;
                for (const game of games) {
                    const result = await syncTournamentsToDb(game, limit);
                    totalCount += result.count;
                }
                results.tournaments = {
                    success: true,
                    message: `Synced tournaments for ${games.length} games`,
                    count: totalCount,
                };
            }
        }

        const totalCount = Object.values(results).reduce((sum, r) => sum + r.count, 0);

        return NextResponse.json({
            success: true,
            syncedAt: new Date().toISOString(),
            gamesProcessed: games,
            totalCount,
            results,
        });
    } catch (error) {
        console.error('[Sync API] POST Error:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
