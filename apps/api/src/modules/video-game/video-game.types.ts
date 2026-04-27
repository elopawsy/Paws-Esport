/**
 * VideoGame domain DTOs.
 *
 * These types live in the API for now. Once a second consumer needs
 * them (web, scheduled job), they will move to `packages/shared-types`.
 */

export interface VideoGame {
  id: number;
  slug: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
