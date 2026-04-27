import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class VideoGameRepository {
  constructor(private readonly prisma: PrismaService) {}

  public findAll() {
    return this.prisma.videoGame.findMany({ orderBy: { name: 'asc' } });
  }

  public findById(id: number) {
    return this.prisma.videoGame.findUnique({ where: { id } });
  }

  public findBySlug(slug: string) {
    return this.prisma.videoGame.findUnique({ where: { slug } });
  }
}
