import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MatchService } from "@/services";
import MatchDetailsClient from "./MatchDetailsClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const match = await MatchService.getMatchDetails(id);

    if (!match) {
        return {
            title: "Match non trouvé",
        };
    }

    const team1Name = (match.opponents as any[])?.[0]?.opponent?.name || "TBD";
    const team2Name = (match.opponents as any[])?.[1]?.opponent?.name || "TBD";
    const eventName = (match.league as any)?.name || "Event";
    const title = `${team1Name} vs ${team2Name} - ${eventName} | PawsEsport`;
    const description = `Suivez le match ${team1Name} contre ${team2Name} en direct. Scores, statistiques et résultats du ${eventName}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        }
    };
}

export default async function MatchPage({ params }: PageProps) {
    const { id } = await params;
    const match = await MatchService.getMatchDetails(id);

    if (!match) {
        notFound();
    }

    const team1 = (match.opponents as any[])?.[0]?.opponent;
    const team2 = (match.opponents as any[])?.[1]?.opponent;
    const league = match.league as any;
    const tournament = match.tournament as any;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        "name": `${team1?.name} vs ${team2?.name}`,
        "startDate": match.scheduled_at,
        "endDate": match.end_at, // Optional
        "eventStatus": match.status === "finished" ? "https://schema.org/EventMovedOnline" : "https://schema.org/EventScheduled", // Simplified status
        "competitor": [
            {
                "@type": "SportsTeam",
                "name": team1?.name,
                "logo": team1?.image_url
            },
            {
                "@type": "SportsTeam",
                "name": team2?.name,
                "logo": team2?.image_url
            }
        ],
        "location": {
            "@type": "VirtualLocation",
            "url": `https://pawsesport.com/match/${match.id}`
        },
        "description": `Match ${league?.name} - ${tournament?.name}: ${team1?.name} vs ${team2?.name}`,
        "image": [
            team1?.image_url,
            team2?.image_url
        ].filter(Boolean)
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MatchDetailsClient match={match} />
        </>
    );
}
