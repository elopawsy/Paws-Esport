import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Subscribe to a single live match. The web app uses this to render
 * a live score that updates without polling the REST API.
 */
export const get = query({
  args: { matchId: v.number() },
  handler: async (ctx, { matchId }) => {
    const row = await ctx.db
      .query('liveMatches')
      .withIndex('by_match_id', (q) => q.eq('matchId', matchId))
      .unique();
    return row;
  },
});

/**
 * Push the latest snapshot of a match. The NestJS API calls this
 * each time it sees a score or status change.
 */
export const upsert = mutation({
  args: {
    matchId: v.number(),
    status: v.union(
      v.literal('not_started'),
      v.literal('running'),
      v.literal('finished'),
      v.literal('canceled'),
      v.literal('postponed'),
    ),
    teamA: v.object({
      id: v.number(),
      name: v.string(),
      acronym: v.union(v.string(), v.null()),
      score: v.number(),
    }),
    teamB: v.object({
      id: v.number(),
      name: v.string(),
      acronym: v.union(v.string(), v.null()),
      score: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('liveMatches')
      .withIndex('by_match_id', (q) => q.eq('matchId', args.matchId))
      .unique();

    const payload = { ...args, updatedAt: Date.now() };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert('liveMatches', payload);
  },
});
