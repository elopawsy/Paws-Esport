import { Global, Module } from '@nestjs/common';

import { ConvexClient } from './convex.service';

@Global()
@Module({
  providers: [ConvexClient],
  exports: [ConvexClient],
})
export class ConvexModule {}
