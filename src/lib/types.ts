// Types for HLTV data

export interface TeamRanking {
    id: number;
    name: string;
    logo: string;
    rank: number;
    rankChange: number;
    points: number;
}

export interface Player {
    id: number;
    name: string;
    ign: string;
    image: string;
    country: {
        name: string;
        code: string;
    };
    type?: string;
}

export interface TeamFull {
    id: number;
    name: string;
    logo: string;
    country: {
        name: string;
        code: string;
    };
    rank?: number;
    players: Player[];
    coach?: Player;
}

export interface PlayerFull {
    id: number;
    name: string;
    ign: string;
    image: string;
    age?: number;
    country: {
        name: string;
        code: string;
    };
    team?: {
        id: number;
        name: string;
    };
    statistics?: {
        rating?: number;
        killsPerRound?: number;
        headshots?: number;
        mapsPlayed?: number;
    };
}

export interface Transfer {
    id: string;
    player: Player;
    fromTeam: {
        id: number;
        name: string;
        logo: string;
    };
    toTeam: {
        id: number;
        name: string;
        logo: string;
    };
    timestamp: number;
}

export interface SimulatorState {
    teams: Map<number, TeamFull>;
    transfers: Transfer[];
}
