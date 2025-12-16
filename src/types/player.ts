/**
 * Player type definitions
 */

export interface Player {
  id: number;
  slug: string;
  name: string; // In-game name (IGN)
  first_name: string | null;
  last_name: string | null;
  nationality: string | null;
  image_url: string | null;
  role: string | null;
}

export interface PlayerWithTeam extends Player {
  current_team?: {
    id: number;
    name: string;
    slug: string;
  };
}
