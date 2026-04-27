import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@paws/trpc';

/**
 * React-Query bound tRPC client.
 * Used inside client components: trpc.stats.global.useQuery()
 */
export const trpc = createTRPCReact<AppRouter>();
