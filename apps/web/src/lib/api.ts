/**
 * SDK connection factory.
 *
 * The web app talks to the NestJS API through @paws/api-sdk. On the
 * server we forward the incoming request's cookies so that
 * AuthGuard-protected endpoints work transparently for SSR.
 */

import { headers as nextHeaders } from 'next/headers';
import type { IConnection } from '@paws/api-sdk';

const DEFAULT_HOST = 'http://localhost:3001';

export function getApiHost(): string {
  return process.env.PAWS_API_URL || DEFAULT_HOST;
}

/**
 * Build an IConnection for use inside Server Components / route handlers.
 * Forwards cookies + auth headers so the API can resolve the session.
 */
export async function getServerConnection(): Promise<IConnection> {
  const incoming = await nextHeaders();
  const forwarded: Record<string, string> = {};

  const cookie = incoming.get('cookie');
  if (cookie) forwarded.cookie = cookie;

  const auth = incoming.get('authorization');
  if (auth) forwarded.authorization = auth;

  return {
    host: getApiHost(),
    headers: forwarded,
  };
}

/**
 * Anonymous connection — no cookies forwarded. Use for public
 * endpoints called from edge / cron / un-authenticated paths.
 */
export function getAnonymousConnection(): IConnection {
  return { host: getApiHost() };
}
