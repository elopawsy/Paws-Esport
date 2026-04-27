import { Global, Module } from '@nestjs/common';

import { PandaScoreCache } from './pandascore.cache';
import { PandaScoreClient } from './pandascore.client';

@Global()
@Module({
  providers: [PandaScoreClient, PandaScoreCache],
  exports: [PandaScoreClient, PandaScoreCache],
})
export class PandaScoreModule {}
