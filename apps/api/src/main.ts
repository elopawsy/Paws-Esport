import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.resolve(__dirname, '../../../.env') });

import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'node:fs';

import { AppModule } from './app.module';

const SWAGGER_PATH = path.resolve(__dirname, '..', 'swagger.json');
const DEFAULT_PORT = 3001;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });

  try {
    const document = JSON.parse(readFileSync(SWAGGER_PATH, 'utf8'));
    SwaggerModule.setup('docs', app, document);
  } catch {
    // Swagger spec not generated yet — `pnpm --filter @paws/api swagger` produces it.
  }

  const port = Number(process.env.API_PORT ?? DEFAULT_PORT);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port} (docs: /docs)`);
}

void bootstrap();
