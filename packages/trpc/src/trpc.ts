import { initTRPC } from '@trpc/server';

/**
 * Build the tRPC root. Context is empty for now — adding fields here
 * (db, session, …) is how we'd wire authentication later. Procedures
 * built from `t.procedure` flow through this context.
 */
const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
