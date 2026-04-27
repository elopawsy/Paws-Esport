/**
 * Public surface of the @paws/api-sdk package.
 *
 * The `functional` namespace mirrors the API's controller tree:
 *   import { functional } from "@paws/api-sdk";
 *   await functional.tournaments.list(connection, { game: "cs-2" });
 */
export * as functional from './functional';
export type { IConnection } from '@nestia/fetcher';
