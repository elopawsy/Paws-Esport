import { Injectable, NotFoundException } from '@nestjs/common';

import type { VideoGame } from './video-game.types';
import { VideoGameRepository } from './video-game.repository';

@Injectable()
export class VideoGameService {
  constructor(private readonly repository: VideoGameRepository) {}

  public async list(): Promise<VideoGame[]> {
    const rows = await this.repository.findAll();
    return rows.map(toDomain);
  }

  public async getById(id: number): Promise<VideoGame> {
    const row = await this.repository.findById(id);
    if (!row) {
      throw new NotFoundException(`VideoGame ${id} not found`);
    }
    return toDomain(row);
  }
}

function toDomain(row: {
  id: number;
  slug: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}): VideoGame {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
