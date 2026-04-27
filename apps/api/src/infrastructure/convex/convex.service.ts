import { Injectable, Logger } from '@nestjs/common';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@paws/convex';

export interface LiveMatchSnapshot {
  matchId: number;
  status: 'not_started' | 'running' | 'finished' | 'canceled' | 'postponed';
  teamA: { id: number; name: string; acronym: string | null; score: number };
  teamB: { id: number; name: string; acronym: string | null; score: number };
}

/**
 * Server-side Convex client. The API is the only writer of
 * liveMatches — it pushes snapshots whenever a poll surface change.
 *
 * The HTTP client (no websocket) is intentional: from a NestJS
 * service we just need fire-and-forget mutations, not subscriptions.
 */
@Injectable()
export class ConvexClient {
  private readonly logger = new Logger(ConvexClient.name);
  private readonly client: ConvexHttpClient | null;

  constructor() {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_SELF_HOSTED_URL;
    if (!url) {
      this.logger.warn('CONVEX_SELF_HOSTED_URL is not set — Convex pushes are disabled');
      this.client = null;
      return;
    }
    this.client = new ConvexHttpClient(url);
  }

  public isEnabled(): boolean {
    return this.client !== null;
  }

  public async pushLiveMatch(snapshot: LiveMatchSnapshot): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.mutation(api.liveMatches.upsert, snapshot);
    } catch (error) {
      this.logger.warn(
        `Failed to push live match #${snapshot.matchId}: ${(error as Error).message}`,
      );
    }
  }
}
