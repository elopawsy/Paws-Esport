import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamService } from "@/services/team.service";
import TeamDetailsClient from "./TeamDetailsClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const teamId = parseInt(id, 10);
    const team = await TeamService.getTeamById(teamId);

    if (!team) {
        return {
            title: "Team Not Found",
        };
    }

    return {
        title: `${team.name} Roster & Matches | CS Transfer Simulator`,
        description: `View ${team.name} active roster, upcoming matches, and team statistics.`,
        openGraph: {
            images: team.image_url ? [team.image_url] : [],
        },
    };
}

export default async function TeamPage({ params }: PageProps) {
    const { id } = await params;
    const teamId = parseInt(id, 10);

    const team = await TeamService.getTeamById(teamId);

    if (!team) {
        notFound();
    }

    // Fetch matches and related teams (sister teams in other games)
    const [matches, relatedTeams] = await Promise.all([
        TeamService.getTeamMatches(teamId),
        TeamService.getRelatedTeams(team.name, teamId),
    ]);

    return (
        <TeamDetailsClient
            team={team}
            matches={matches}
            relatedTeams={relatedTeams}
        />
    );
}
