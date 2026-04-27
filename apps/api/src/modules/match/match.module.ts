import { Module } from '@nestjs/common';

import { MatchController } from './match.controller';
import { MatchRepository } from './match.repository';
import { MatchService } from './match.service';

@Module({
  controllers: [MatchController],
  providers: [MatchService, MatchRepository],
  exports: [MatchService],
})
export class MatchModule {}
