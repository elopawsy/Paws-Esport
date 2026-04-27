import core from '@nestia/core';
import { Controller } from '@nestjs/common';

import { Public } from '../../infrastructure/auth/public.decorator';
import {
  ConvexClient,
  type LiveMatchSnapshot,
} from '../../infrastructure/convex/convex.service';

interface PushAck {
  pushed: boolean;
  enabled: boolean;
}

/**
 * Manual trigger to push a live-match snapshot through Convex.
 * Useful for verifying the realtime pipeline end-to-end before we
 * wire it to a scheduled poller.
 */
@Public()
@Controller('debug/live-matches')
export class LiveMatchDebugController {
  constructor(private readonly convex: ConvexClient) {}

  @core.TypedRoute.Post()
  public async push(@core.TypedBody() snapshot: LiveMatchSnapshot): Promise<PushAck> {
    if (!this.convex.isEnabled()) {
      return { pushed: false, enabled: false };
    }
    await this.convex.pushLiveMatch(snapshot);
    return { pushed: true, enabled: true };
  }
}
