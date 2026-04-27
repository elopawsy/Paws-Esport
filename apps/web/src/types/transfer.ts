/**
 * Transfer type definitions
 */

import type { Player } from './player';
import type { Team } from './team';

export interface Transfer {
  id: string;
  player: Player;
  fromTeam: Team;
  toTeam: Team;
  timestamp: number;
}
