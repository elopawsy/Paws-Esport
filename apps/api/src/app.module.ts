import { Module } from '@nestjs/common';

import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { VideoGameModule } from './modules/video-game/video-game.module';

@Module({
  imports: [PrismaModule, HealthModule, VideoGameModule],
})
export class AppModule {}
