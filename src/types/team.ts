/**
 * Team type definitions
 */

import type { Player } from './player';

export interface Team {
  id: number;
  slug: string;
  name: string;
  acronym: string | null;
  image_url: string | null;
  location: string | null;
  players: Player[];
  current_videogame?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface TeamBasic {
  id: number;
  slug: string;
  name: string;
  acronym: string | null;
  image_url: string | null;
  location: string | null;
}
