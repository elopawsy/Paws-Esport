import core from '@nestia/core';
import { Controller } from '@nestjs/common';

import { Public } from '../../infrastructure/auth/public.decorator';
import type { VideoGame } from './video-game.types';
import { VideoGameService } from './video-game.service';

@Public()
@Controller('video-games')
export class VideoGameController {
  constructor(private readonly service: VideoGameService) {}

  /**
   * List every video game tracked by the platform, ordered by name.
   */
  @core.TypedRoute.Get()
  public list(): Promise<VideoGame[]> {
    return this.service.list();
  }

  /**
   * Get a single video game by its numeric id.
   */
  @core.TypedRoute.Get(':id')
  public getById(@core.TypedParam('id') id: number): Promise<VideoGame> {
    return this.service.getById(id);
  }
}
