import { NestFactory } from '@nestjs/core';
import type { INestiaConfig } from '@nestia/sdk';

import { AppModule } from './src/app.module';

const config: INestiaConfig = {
  input: () => NestFactory.create(AppModule),
  output: '../../packages/api-sdk/src',
  distribute: '../../packages/api-sdk',
  swagger: {
    output: 'swagger.json',
    servers: [{ url: 'http://localhost:3001', description: 'Local' }],
    beautify: true,
  },
  primitive: false,
  simulate: false,
};

export default config;
