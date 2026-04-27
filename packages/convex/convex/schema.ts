import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Real-time tables for Paws Esport.
 *
 * `liveMatches` shadows a tiny slice of the PandaScore match data —
 * just enough to push live score deltas to subscribed clients without
 * forcing them to re-poll the REST API. The NestJS API is the only
 * writer; the web is the only reader.
 */
export default defineSchema({
  liveMatches: defineTable({
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
    updatedAt: v.number(),
  }).index('by_match_id', ['matchId']),
});
