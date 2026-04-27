import { Metadata } from "next";
import { PlayerService } from "@/services";
import PlayerDetailsClient from "./PlayerDetailsClient";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const player = await PlayerService.getPlayerById(parseInt(id));

    if (!player) {
        return { title: "Player Not Found" };
    }

    return {
        title: `${player.name} - Player Profile`,
        description: `View ${player.name}'s esports profile, stats and team history.`,
        openGraph: {
            title: `${player.name} - Player Profile | PawsEsport`,
            description: `Professional esports player profile for ${player.name}.`,
            images: player.image_url ? [player.image_url] : [],
        },
    };
}

export default async function PlayerPage({ params }: Props) {
    const { id } = await params;
    const player = await PlayerService.getPlayerById(parseInt(id));

    if (!player) {
        notFound();
    }

    return <PlayerDetailsClient player={player} />;
}
