import { publicProcedure, router } from './trpc';

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
