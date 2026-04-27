import { Module } from '@nestjs/common';

import { AuthModule } from './infrastructure/auth/auth.module';
import { PandaScoreModule } from './infrastructure/pandascore/pandascore.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { MatchModule } from './modules/match/match.module';
import { MeModule } from './modules/me/me.module';
import { TournamentModule } from './modules/tournament/tournament.module';
import { VideoGameModule } from './modules/video-game/video-game.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PandaScoreModule,
    HealthModule,
    VideoGameModule,
    MeModule,
    TournamentModule,
    MatchModule,
  ],
})
export class AppModule {}
