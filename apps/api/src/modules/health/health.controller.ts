import core from '@nestia/core';
import { Controller } from '@nestjs/common';

import { Public } from '../../infrastructure/auth/public.decorator';

export interface HealthStatus {
  status: 'ok';
  uptime: number;
  timestamp: string;
}

@Public()
@Controller('health')
export class HealthController {
  @core.TypedRoute.Get()
  public check(): HealthStatus {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
