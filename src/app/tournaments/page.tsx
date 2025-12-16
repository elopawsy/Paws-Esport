import { Metadata } from "next";
import { TournamentService } from "@/services";
import TournamentsClient from "./TournamentsClient";

export const metadata: Metadata = {
    title: "Tournois Esports - Calendrier et Résultats CS2, LoL, Valorant",
    description: "Découvrez tous les tournois esports en cours et à venir. Calendrier complet, résultats en direct et classements pour Counter-Strike 2, League of Legends et Valorant.",
};

export default async function TournamentsPage() {
    // Fetch initial data for CS2 (default)
    // Types are inferred from Service return type
    const [running, upcoming, past] = await Promise.all([
        TournamentService.getRunningTournaments("cs-2"),
        TournamentService.getUpcomingTournaments("cs-2"),
        TournamentService.getPastTournaments("cs-2"),
    ]);

    const initialData = {
        running,
        upcoming,
        past,
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Tournois Esports CS2",
        "description": "Liste des tournois esports Counter-Strike 2 en cours et à venir.",
        "hasPart": [
            ...running.map((t: any) => ({
                "@type": "SportsEvent",
                "name": t.name,
                "startDate": t.begin_at,
                "endDate": t.end_at,
                "location": {
                    "@type": "VirtualLocation",
                    "url": `https://pawsesport.com/tournaments/${t.slug || t.id}`
                }
            })),
            ...upcoming.slice(0, 10).map((t: any) => ({
                "@type": "SportsEvent",
                "name": t.name,
                "startDate": t.begin_at,
                "location": {
                    "@type": "VirtualLocation",
                    "url": `https://pawsesport.com/tournaments/${t.slug || t.id}`
                }
            }))
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TournamentsClient initialData={initialData} />
        </>
    );
}
