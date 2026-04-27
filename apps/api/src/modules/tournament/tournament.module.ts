import { Module } from '@nestjs/common';

import { TournamentController } from './tournament.controller';
import { TournamentRepository } from './tournament.repository';
import { TournamentService } from './tournament.service';

@Module({
  controllers: [TournamentController],
  providers: [TournamentService, TournamentRepository],
  exports: [TournamentService],
})
export class TournamentModule {}
