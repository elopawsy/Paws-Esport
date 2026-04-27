import { publicProcedure, router } from './trpc';

/**
 * The whole tRPC surface. Today it exposes a single
 * `stats.global` procedure that just bounces a snapshot of static
 * info — wired this way so the plumbing (server handler, client
 * provider, end-to-end types) is in place when we want a real
 * procedure.
 */
export const appRouter = router({
  stats: router({
    global: publicProcedure.query(() => ({
      message: 'tRPC is wired end-to-end',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })),
  }),
});

export type AppRouter = typeof appRouter;
