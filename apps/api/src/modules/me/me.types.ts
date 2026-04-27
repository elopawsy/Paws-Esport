/**
 * Authenticated user payload exposed by the API.
 * This is intentionally a slim projection of Better Auth's user model,
 * so a future migration of the auth provider does not leak.
 */
export interface MeProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  role: string;
  coins: number;
  createdAt: string;
}
