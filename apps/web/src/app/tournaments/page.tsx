import { Metadata } from "next";
import { TournamentService } from "@/services";
import TournamentsClient from "./TournamentsClient";

export const metadata: Metadata = {
    title: "Esports Tournaments - Calendar and Results CS2, LoL, Valorant",
    description: "Discover all ongoing and upcoming esports tournaments. Complete calendar, live results, and rankings for Counter-Strike 2, League of Legends, and Valorant.",
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
        "name": "CS2 Esports Tournaments",
        "description": "List of ongoing and upcoming Counter-Strike 2 esports tournaments.",
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
