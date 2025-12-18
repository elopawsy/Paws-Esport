/**
 * Database Sync Service
 * 
 * Handles synchronization between PandaScore API and the database.
 * Provides methods to upsert data and sync from API to DB.
 */

import { prisma } from '@/lib/db';
import { apiClient } from '@/infrastructure/pandascore/ApiClient';
import { isSDKConfigured } from '@/infrastructure/pandascore';

// ===========================================
// Types
// ===========================================

interface SyncResult {
    success: boolean;
    message: string;
    count: number;
}

// ===========================================
// Team Operations
// ===========================================

/**
 * Upsert a team into the database
 */
export async function upsertTeam(teamData: {
    id: number;
    slug: string;
    name: string;
    acronym?: string | null;
    imageUrl?: string | null;
    location?: string | null;
    videogameId?: number | null;
}) {
    return prisma.team.upsert({
        where: { id: teamData.id },
        update: {
            slug: teamData.slug,
            name: teamData.name,
            acronym: teamData.acronym,
            imageUrl: teamData.imageUrl,
            location: teamData.location,
            videogameId: teamData.videogameId,
            updatedAt: new Date(),
        },
        create: {
            id: teamData.id,
            slug: teamData.slug,
            name: teamData.name,
            acronym: teamData.acronym,
            imageUrl: teamData.imageUrl,
            location: teamData.location,
            videogameId: teamData.videogameId,
        },
    });
}

/**
 * Upsert a player into the database
 */
export async function upsertPlayer(playerData: {
    id: number;
    slug: string;
    name: string;
    firstName?: string | null;
    lastName?: string | null;
    nationality?: string | null;
    imageUrl?: string | null;
    role?: string | null;
    teamId?: number | null;
}) {
    return prisma.player.upsert({
        where: { id: playerData.id },
        update: {
            slug: playerData.slug,
            name: playerData.name,
            firstName: playerData.firstName,
            lastName: playerData.lastName,
            nationality: playerData.nationality,
            imageUrl: playerData.imageUrl,
            role: playerData.role,
            teamId: playerData.teamId,
            updatedAt: new Date(),
        },
        create: {
            id: playerData.id,
            slug: playerData.slug,
            name: playerData.name,
            firstName: playerData.firstName,
            lastName: playerData.lastName,
            nationality: playerData.nationality,
            imageUrl: playerData.imageUrl,
            role: playerData.role,
            teamId: playerData.teamId,
        },
    });
}

// ===========================================
// Match Operations
// ===========================================

/**
 * Upsert a match into the database
 */
export async function upsertMatch(matchData: {
    id: number;
    slug: string;
    name: string;
    status: string;
    scheduledAt?: Date | null;
    beginAt?: Date | null;
    endAt?: Date | null;
    tier: string;
    numberOfGames?: number | null;
    leagueId?: number | null;
    serieId?: number | null;
    tournamentId?: number | null;
    opponents?: Array<{ teamId: number; score: number }>;
    streams?: Array<{
        language: string;
        rawUrl: string;
        embedUrl?: string | null;
        official: boolean;
        main: boolean;
    }>;
}) {
    // First upsert the match itself
    const match = await prisma.match.upsert({
        where: { id: matchData.id },
        update: {
            slug: matchData.slug,
            name: matchData.name,
            status: matchData.status,
            scheduledAt: matchData.scheduledAt,
            beginAt: matchData.beginAt,
            endAt: matchData.endAt,
            tier: matchData.tier,
            numberOfGames: matchData.numberOfGames,
            leagueId: matchData.leagueId,
            serieId: matchData.serieId,
            tournamentId: matchData.tournamentId,
            updatedAt: new Date(),
        },
        create: {
            id: matchData.id,
            slug: matchData.slug,
            name: matchData.name,
            status: matchData.status,
            scheduledAt: matchData.scheduledAt,
            beginAt: matchData.beginAt,
            endAt: matchData.endAt,
            tier: matchData.tier,
            numberOfGames: matchData.numberOfGames,
            leagueId: matchData.leagueId,
            serieId: matchData.serieId,
            tournamentId: matchData.tournamentId,
        },
    });

    // Handle opponents
    if (matchData.opponents) {
        // Delete existing opponents
        await prisma.matchOpponent.deleteMany({
            where: { matchId: matchData.id },
        });

        // Create new opponents
        for (const opp of matchData.opponents) {
            await prisma.matchOpponent.create({
                data: {
                    matchId: matchData.id,
                    teamId: opp.teamId,
                    score: opp.score,
                },
            });
        }
    }

    // Handle streams
    if (matchData.streams) {
        // Delete existing streams
        await prisma.matchStream.deleteMany({
            where: { matchId: matchData.id },
        });

        // Create new streams
        for (const stream of matchData.streams) {
            await prisma.matchStream.create({
                data: {
                    matchId: matchData.id,
                    language: stream.language,
                    rawUrl: stream.rawUrl,
                    embedUrl: stream.embedUrl,
                    official: stream.official,
                    main: stream.main,
                },
            });
        }
    }

    return match;
}

// ===========================================
// Tournament/League/Serie Operations
// ===========================================

export async function upsertLeague(leagueData: {
    id: number;
    slug: string;
    name: string;
    imageUrl?: string | null;
}) {
    return prisma.league.upsert({
        where: { id: leagueData.id },
        update: {
            slug: leagueData.slug,
            name: leagueData.name,
            imageUrl: leagueData.imageUrl,
            updatedAt: new Date(),
        },
        create: {
            id: leagueData.id,
            slug: leagueData.slug,
            name: leagueData.name,
            imageUrl: leagueData.imageUrl,
        },
    });
}

export async function upsertSerie(serieData: {
    id: number;
    slug: string;
    name?: string | null;
    fullName?: string | null;
    beginAt?: Date | null;
    endAt?: Date | null;
    leagueId?: number | null;
}) {
    return prisma.serie.upsert({
        where: { id: serieData.id },
        update: {
            slug: serieData.slug,
            name: serieData.name,
            fullName: serieData.fullName,
            beginAt: serieData.beginAt,
            endAt: serieData.endAt,
            leagueId: serieData.leagueId,
            updatedAt: new Date(),
        },
        create: {
            id: serieData.id,
            slug: serieData.slug,
            name: serieData.name,
            fullName: serieData.fullName,
            beginAt: serieData.beginAt,
            endAt: serieData.endAt,
            leagueId: serieData.leagueId,
        },
    });
}

export async function upsertTournament(tournamentData: {
    id: number;
    slug: string;
    name: string;
    tier?: string | null;
    beginAt?: Date | null;
    endAt?: Date | null;
    prizepool?: string | null;
    serieId?: number | null;
}) {
    return prisma.tournament.upsert({
        where: { id: tournamentData.id },
        update: {
            slug: tournamentData.slug,
            name: tournamentData.name,
            tier: tournamentData.tier,
            beginAt: tournamentData.beginAt,
            endAt: tournamentData.endAt,
            prizepool: tournamentData.prizepool,
            serieId: tournamentData.serieId,
            updatedAt: new Date(),
        },
        create: {
            id: tournamentData.id,
            slug: tournamentData.slug,
            name: tournamentData.name,
            tier: tournamentData.tier,
            beginAt: tournamentData.beginAt,
            endAt: tournamentData.endAt,
            prizepool: tournamentData.prizepool,
            serieId: tournamentData.serieId,
        },
    });
}

// ===========================================
// Sync Functions from PandaScore API
// ===========================================

/**
 * Sync teams from PandaScore to database
 * @param videogame - Game slug to sync (default: 'cs-2')
 * @param limit - Number of items to fetch (default: 50, max: 100)
 */
export async function syncTeamsToDb(videogame: string = 'cs-2', limit: number = 50): Promise<SyncResult> {
    if (!isSDKConfigured()) {
        return { success: false, message: 'API key not configured', count: 0 };
    }

    try {
        const response = await apiClient.getMatches(videogame as any, {
            'page[size]': Math.min(limit, 100),
        });

        const teamsMap = new Map<number, any>();

        for (const match of response.data) {
            if (match.opponents) {
                for (const opp of match.opponents) {
                    if (opp.opponent && opp.type === 'Team') {
                        teamsMap.set(opp.opponent.id, opp.opponent);
                    }
                }
            }
        }

        let count = 0;
        for (const [, teamData] of teamsMap) {
            await upsertTeam({
                id: teamData.id,
                slug: teamData.slug,
                name: teamData.name,
                acronym: teamData.acronym,
                imageUrl: teamData.image_url,
                location: teamData.location,
                videogameId: 3, // CS2
            });

            // Also upsert players if available
            if (teamData.players) {
                for (const player of teamData.players) {
                    await upsertPlayer({
                        id: player.id,
                        slug: player.slug,
                        name: player.name,
                        firstName: player.first_name,
                        lastName: player.last_name,
                        nationality: player.nationality,
                        imageUrl: player.image_url,
                        role: player.role,
                        teamId: teamData.id,
                    });
                }
            }

            count++;
        }

        return {
            success: true,
            message: `Synced ${count} teams to database`,
            count
        };
    } catch (error) {
        console.error('Failed to sync teams:', error);
        return {
            success: false,
            message: `Failed to sync teams: ${error}`,
            count: 0
        };
    }
}

/**
 * Sync matches from PandaScore to database
 * @param status - Match status filter (optional)
 * @param videogame - Game slug to sync (default: 'cs-2')
 * @param limit - Number of items to fetch (default: 50, max: 100)
 */
export async function syncMatchesToDb(status?: string, videogame: string = 'cs-2', limit: number = 50): Promise<SyncResult> {
    if (!isSDKConfigured()) {
        return { success: false, message: 'API key not configured', count: 0 };
    }

    try {
        const params: Record<string, any> = { 'page[size]': Math.min(limit, 100) };
        if (status) {
            params['filter[status]'] = status;
        }

        const response = await apiClient.getMatches(videogame as any, params);

        let count = 0;
        for (const match of response.data) {
            // Upsert league if exists
            if (match.league) {
                await upsertLeague({
                    id: match.league.id,
                    slug: match.league.slug,
                    name: match.league.name,
                    imageUrl: match.league.image_url,
                });
            }

            // Upsert serie if exists
            if (match.serie) {
                await upsertSerie({
                    id: match.serie.id,
                    slug: match.serie.slug,
                    name: match.serie.name,
                    fullName: match.serie.full_name,
                    beginAt: match.serie.begin_at ? new Date(match.serie.begin_at) : null,
                    endAt: match.serie.end_at ? new Date(match.serie.end_at) : null,
                    leagueId: match.league?.id,
                });
            }

            // Upsert tournament if exists
            if (match.tournament) {
                await upsertTournament({
                    id: match.tournament.id,
                    slug: match.tournament.slug,
                    name: match.tournament.name,
                    tier: match.tournament.tier,
                    beginAt: match.tournament.begin_at ? new Date(match.tournament.begin_at) : null,
                    endAt: match.tournament.end_at ? new Date(match.tournament.end_at) : null,
                    prizepool: match.tournament.prizepool,
                    serieId: match.serie?.id,
                });
            }

            // Upsert teams from opponents
            const opponents: Array<{ teamId: number; score: number }> = [];
            if (match.opponents) {
                for (const opp of match.opponents) {
                    if (opp.opponent && opp.type === 'Team') {
                        await upsertTeam({
                            id: opp.opponent.id,
                            slug: opp.opponent.slug,
                            name: opp.opponent.name,
                            acronym: opp.opponent.acronym,
                            imageUrl: opp.opponent.image_url,
                            location: opp.opponent.location,
                        });

                        // Get score from results
                        const result = match.results?.find((r: any) => r.team_id === opp.opponent.id);
                        opponents.push({
                            teamId: opp.opponent.id,
                            score: result?.score ?? 0,
                        });
                    }
                }
            }

            // Determine tier
            let tier = 'Other';
            if (match.tournament?.tier === 's' || match.tournament?.tier === 'a') {
                tier = 'Tier 1';
            } else if (match.tournament?.tier === 'b') {
                tier = 'Tier 2';
            }

            // Upsert the match
            await upsertMatch({
                id: match.id,
                slug: match.slug,
                name: match.name,
                status: match.status,
                scheduledAt: match.scheduled_at ? new Date(match.scheduled_at) : null,
                beginAt: match.begin_at ? new Date(match.begin_at) : null,
                endAt: match.end_at ? new Date(match.end_at) : null,
                tier,
                numberOfGames: match.number_of_games,
                leagueId: match.league?.id,
                serieId: match.serie?.id,
                tournamentId: match.tournament?.id,
                opponents,
                streams: match.streams_list?.map((s: any) => ({
                    language: s.language || 'en',
                    rawUrl: s.raw_url,
                    embedUrl: s.embed_url,
                    official: s.official ?? false,
                    main: s.main ?? false,
                })),
            });

            count++;
        }

        return {
            success: true,
            message: `Synced ${count} matches to database`,
            count
        };
    } catch (error) {
        console.error('Failed to sync matches:', error);
        return {
            success: false,
            message: `Failed to sync matches: ${error}`,
            count: 0
        };
    }
}

/**
 * Sync tournaments from PandaScore to database
 * @param videogame - Game slug to sync (default: 'cs-2')
 * @param limit - Number of items to fetch (default: 50, max: 100)
 */
export async function syncTournamentsToDb(videogame: string = 'cs-2', limit: number = 50): Promise<SyncResult> {
    if (!isSDKConfigured()) {
        return { success: false, message: 'API key not configured', count: 0 };
    }

    try {
        const response = await apiClient.getTournaments(videogame as any, {
            'page[size]': Math.min(limit, 100),
        });

        let count = 0;
        for (const tournament of response.data) {
            // Upsert league if exists
            if (tournament.league) {
                await upsertLeague({
                    id: tournament.league.id,
                    slug: tournament.league.slug,
                    name: tournament.league.name,
                    imageUrl: tournament.league.image_url,
                });
            }

            // Upsert serie if exists
            if (tournament.serie) {
                await upsertSerie({
                    id: tournament.serie.id,
                    slug: tournament.serie.slug,
                    name: tournament.serie.name,
                    fullName: tournament.serie.full_name,
                    beginAt: tournament.serie.begin_at ? new Date(tournament.serie.begin_at) : null,
                    endAt: tournament.serie.end_at ? new Date(tournament.serie.end_at) : null,
                    leagueId: tournament.league?.id,
                });
            }

            // Upsert tournament
            await upsertTournament({
                id: tournament.id,
                slug: tournament.slug,
                name: tournament.name,
                tier: tournament.tier,
                beginAt: tournament.begin_at ? new Date(tournament.begin_at) : null,
                endAt: tournament.end_at ? new Date(tournament.end_at) : null,
                prizepool: tournament.prizepool,
                serieId: tournament.serie?.id,
            });

            count++;
        }

        return {
            success: true,
            message: `Synced ${count} tournaments to database`,
            count
        };
    } catch (error) {
        console.error('Failed to sync tournaments:', error);
        return {
            success: false,
            message: `Failed to sync tournaments: ${error}`,
            count: 0
        };
    }
}

// ===========================================
// Refresh Functions (Single Item)
// ===========================================

/**
 * Refresh a single match from PandaScore API
 */
export async function refreshMatchFromApi(matchId: number) {
    if (!isSDKConfigured()) {
        return null;
    }

    try {
        const response = await apiClient.getMatchById(matchId);
        const match = response.data;

        // Determine tier
        let tier = 'Other';
        if (match.tournament?.tier === 's' || match.tournament?.tier === 'a') {
            tier = 'Tier 1';
        } else if (match.tournament?.tier === 'b') {
            tier = 'Tier 2';
        }

        // Build opponents
        const opponents: Array<{ teamId: number; score: number }> = [];
        if (match.opponents) {
            for (const opp of match.opponents) {
                if (opp.opponent && opp.type === 'Team') {
                    const result = match.results?.find((r: any) => r.team_id === opp.opponent.id);
                    opponents.push({
                        teamId: opp.opponent.id,
                        score: result?.score ?? 0,
                    });
                }
            }
        }

        await upsertMatch({
            id: match.id,
            slug: match.slug,
            name: match.name,
            status: match.status,
            scheduledAt: match.scheduled_at ? new Date(match.scheduled_at) : null,
            beginAt: match.begin_at ? new Date(match.begin_at) : null,
            endAt: match.end_at ? new Date(match.end_at) : null,
            tier,
            numberOfGames: match.number_of_games,
            leagueId: match.league?.id,
            serieId: match.serie?.id,
            tournamentId: match.tournament?.id,
            opponents,
        });

        return prisma.match.findUnique({
            where: { id: matchId },
            include: {
                opponents: { include: { team: true } },
                streams: true,
                tournament: true,
            },
        });
    } catch (error) {
        console.error(`Failed to refresh match ${matchId}:`, error);
        return null;
    }
}

/**
 * Refresh a single team from PandaScore API
 */
export async function refreshTeamFromApi(teamId: number) {
    if (!isSDKConfigured()) {
        return null;
    }

    try {
        const response = await apiClient.getTeamById(teamId);
        const team = response.data;

        await upsertTeam({
            id: team.id,
            slug: team.slug,
            name: team.name,
            acronym: team.acronym,
            imageUrl: team.image_url,
            location: team.location,
        });

        // Upsert players
        if (team.players) {
            for (const player of team.players) {
                await upsertPlayer({
                    id: player.id,
                    slug: player.slug,
                    name: player.name,
                    firstName: player.first_name,
                    lastName: player.last_name,
                    nationality: player.nationality,
                    imageUrl: player.image_url,
                    role: player.role,
                    teamId: team.id,
                });
            }
        }

        return prisma.team.findUnique({
            where: { id: teamId },
            include: { players: true },
        });
    } catch (error) {
        console.error(`Failed to refresh team ${teamId}:`, error);
        return null;
    }
}

// ===========================================
// Get from Database (with fallback)
// ===========================================

/**
 * Get team from database, or null if not found
 */
export async function getTeamFromDb(teamId: number) {
    return prisma.team.findUnique({
        where: { id: teamId },
        include: { players: true, videogame: true },
    });
}

/**
 * Get match from database, or null if not found
 */
export async function getMatchFromDb(matchId: number) {
    return prisma.match.findUnique({
        where: { id: matchId },
        include: {
            opponents: { include: { team: true } },
            streams: true,
            tournament: true,
            league: true,
            serie: true,
        },
    });
}

/**
 * Get player from database, or null if not found
 */
export async function getPlayerFromDb(playerId: number) {
    return prisma.player.findUnique({
        where: { id: playerId },
        include: { team: true },
    });
}
