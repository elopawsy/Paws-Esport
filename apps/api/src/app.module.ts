import { Module } from '@nestjs/common';

import { AuthModule } from './infrastructure/auth/auth.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { MeModule } from './modules/me/me.module';
import { VideoGameModule } from './modules/video-game/video-game.module';

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, VideoGameModule, MeModule],
})
export class AppModule {}
