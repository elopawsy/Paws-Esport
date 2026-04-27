import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import {
  ConvexClient,
  type LiveMatchSnapshot,
} from '../../infrastructure/convex/convex.service';
import type { VideoGameSlug } from '../../infrastructure/pandascore/pandascore.types';
import type { Match } from './match.types';
import { MatchService } from './match.service';

const TRACKED_GAMES: readonly VideoGameSlug[] = ['cs-2', 'valorant', 'lol'] as const;

interface SnapshotFingerprint {
  status: LiveMatchSnapshot['status'];
  scoreA: number;
  scoreB: number;
}

/**
 * Polls PandaScore for running matches across the games we track and
 * pushes them to Convex. The poller is intentionally idempotent:
 * a fingerprint of the last snapshot we sent is kept in memory, and
 * we skip pushing when nothing changed — Convex stays the source of
 * truth for "what changed since the last tick" without us having to
 * read it back.
 */
@Injectable()
export class LiveMatchPoller {
  private readonly logger = new Logger(LiveMatchPoller.name);
  private readonly lastSeen = new Map<number, SnapshotFingerprint>();

  constructor(
    private readonly matchService: MatchService,
    private readonly convex: ConvexClient,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  public async tick(): Promise<void> {
    if (!this.convex.isEnabled()) return;

    const matches = await this.collectRunningMatches();

    let pushed = 0;
    for (const match of matches) {
      const snapshot = toSnapshot(match);
      if (!snapshot) continue;

      if (this.isUnchanged(snapshot)) continue;

      await this.convex.pushLiveMatch(snapshot);
      this.remember(snapshot);
      pushed += 1;
    }

    if (pushed > 0) {
      this.logger.log(`Pushed ${pushed}/${matches.length} live snapshots to Convex`);
    }
  }

  private async collectRunningMatches(): Promise<Match[]> {
    const all: Match[] = [];
    for (const game of TRACKED_GAMES) {
      try {
        const list = await this.matchService.listByStatus(game, 'running', 50);
        all.push(...list);
      } catch (error) {
        this.logger.warn(`Failed to list running matches for ${game}: ${(error as Error).message}`);
      }
    }
    return all;
  }

  private isUnchanged(snapshot: LiveMatchSnapshot): boolean {
    const previous = this.lastSeen.get(snapshot.matchId);
    if (!previous) return false;
    return (
      previous.status === snapshot.status &&
      previous.scoreA === snapshot.teamA.score &&
      previous.scoreB === snapshot.teamB.score
    );
  }

  private remember(snapshot: LiveMatchSnapshot): void {
    this.lastSeen.set(snapshot.matchId, {
      status: snapshot.status,
      scoreA: snapshot.teamA.score,
      scoreB: snapshot.teamB.score,
    });
  }
}

function toSnapshot(match: Match): LiveMatchSnapshot | null {
  const teamA = match.opponents[0]?.team;
  const teamB = match.opponents[1]?.team;
  if (!teamA || !teamB) return null;

  const scoreA = match.results.find((r) => r.teamId === teamA.id)?.score ?? 0;
  const scoreB = match.results.find((r) => r.teamId === teamB.id)?.score ?? 0;

  return {
    matchId: match.id,
    status: match.status,
    teamA: { id: teamA.id, name: teamA.name, acronym: teamA.acronym, score: scoreA },
    teamB: { id: teamB.id, name: teamB.name, acronym: teamB.acronym, score: scoreB },
  };
}
