/**
 * Public surface of @paws/convex.
 *
 * Re-exports the generated `api` map so the web and the NestJS API
 * can reference functions in a typed way:
 *   import { api } from "@paws/convex";
 *   await convex.mutation(api.liveMatches.upsert, { ... });
 */
export { api } from '../convex/_generated/api.js';
export type { Id, Doc } from '../convex/_generated/dataModel';
