import { StaticImport } from "next/dist/shared/lib/get-img-props";

export interface Player {
    ign: string;
    id: number;
    slug: string;
    name: string; // IGN
    first_name: string | null;
    last_name: string | null;
    nationality: string | null;
    image_url: string | null;
    role: string | null;
}

export interface Team {
    logo: string | StaticImport;
    id: number;
    slug: string;
    name: string;
    acronym: string | null;
    image_url: string | null;
    location: string | null;
    players: Player[];
}

export interface Transfer {
    id: string;
    player: Player;
    fromTeam: Team;
    toTeam: Team;
    timestamp: number;
}