
import { apiClient } from './src/infrastructure/pandascore/ApiClient';

async function main() {
    try {
        const tournamentId = 18521; // From previous run
        console.log(`Fetching tournament details for ID: ${tournamentId}...`);
        
        const tournamentResponse = await apiClient.getTournamentById(tournamentId);
        const tournament = tournamentResponse.data;

        console.log("Tournament Data Keys:", Object.keys(tournament));
        console.log("Tournament Structure Info:", {
             matches: tournament.matches?.length,
             rounds: tournament.rounds, // hypothetical
             brackets: tournament.brackets, // hypothetical
             format: tournament.format, // hypothetical
        });
        
        if (tournament.matches && tournament.matches.length > 0) {
            console.log("First Match in Tournament Details:", {
                 id: tournament.matches[0].id,
                 name: tournament.matches[0].name,
                 number: tournament.matches[0].number,
                 round: tournament.matches[0].round,
            });
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

main();
