import { Module } from '@nestjs/common';

import { LiveMatchDebugController } from './live-debug.controller';
import { LiveMatchPoller } from './live-match.poller';
import { MatchController } from './match.controller';
import { MatchRepository } from './match.repository';
import { MatchService } from './match.service';

@Module({
  controllers: [MatchController, LiveMatchDebugController],
  providers: [MatchService, MatchRepository, LiveMatchPoller],
  exports: [MatchService],
})
export class MatchModule {}
