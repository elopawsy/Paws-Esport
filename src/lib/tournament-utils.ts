import { TournamentFull } from "@/types";

// Helper to get full display name
// We accept any object that has the shape we need, so it works with TournamentFull or the local Tournament interfaces
interface TournamentLike {
    name: string;
    league: { name: string } | null;
    serie: { full_name: string | null } | null;
}

export function getTournamentDisplayName(tournament: TournamentLike | null): string {
    if (!tournament) return "Tournoi";

    const parts = [];
    if (tournament.league?.name) parts.push(tournament.league.name);
    // Avoid duplication if serie name contains league name
    if (tournament.serie?.full_name) {
        if (!tournament.league?.name || !tournament.serie.full_name.includes(tournament.league.name)) {
            parts.push(tournament.serie.full_name);
        } else {
            // If serie name contains league name, use serie name as base and don't add it again if it was just league name?
            // Actually if Leauge="ESL" and Serie="ESL Pro League", we want just "ESL Pro League".
            // If we pushed League, we have ["ESL", "ESL Pro League"].
            // Unique logic?
            // Let's rely on the previous logic which was simply pushing.
            // But actually users prefer: League + Serie (if not redundant) + Name.
            parts.push(tournament.serie.full_name);
        }
    }

    // Deduplicate strings?
    // "ESL", "ESL Pro League S18", "Playoffs" -> "ESL ESL Pro League S18 Playoffs" -> weird.
    // If Serie starts with League, omit League?
    // Implementation:
    const cleanParts: string[] = [];

    if (tournament.league?.name) {
        cleanParts.push(tournament.league.name);
    }

    if (tournament.serie?.full_name) {
        const serie = tournament.serie.full_name;
        // If serie includes league name, we might want to skip league name or serie?
        // Usually Serie is more specific.
        // If cleanParts has "ESL" and serie is "ESL Pro League", we probably want just "ESL Pro League".
        // Let's replace the last part if it is a prefix of the new part?
        // Or just keep it simple: Add usage to array, then join.
        // But for "ESL" + "ESL Pro League", it's ugly.

        // Check if matching
        if (cleanParts.length > 0 && serie.startsWith(cleanParts[0])) {
            cleanParts.pop(); // Remove League if strictly prefix
        }

        if (cleanParts.length === 0 || cleanParts[cleanParts.length - 1] !== serie) {
            cleanParts.push(serie);
        }
    }

    if (tournament.name) {
        cleanParts.push(tournament.name);
    }

    // Final dedupe logic if still redundant
    return [...new Set(cleanParts)].join(" ");
}
