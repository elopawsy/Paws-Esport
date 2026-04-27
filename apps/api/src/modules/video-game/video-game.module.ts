import { Module } from '@nestjs/common';

import { VideoGameController } from './video-game.controller';
import { VideoGameRepository } from './video-game.repository';
import { VideoGameService } from './video-game.service';

@Module({
  controllers: [VideoGameController],
  providers: [VideoGameService, VideoGameRepository],
  exports: [VideoGameService],
})
export class VideoGameModule {}
