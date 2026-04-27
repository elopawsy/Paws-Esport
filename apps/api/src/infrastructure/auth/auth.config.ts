import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { PrismaClient } from '@paws/db';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

const baseURL =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * The shape of `betterAuth(...)` references zod through a hoisted pnpm
 * path that TS cannot serialize as a portable type (TS2742). We narrow
 * to the surface we actually consume — `api.getSession` and the
 * `$Infer` helpers — so consumers get strong types without TS having
 * to materialize the full Auth<...> generic.
 */
type AuthApi = {
  api: {
    getSession: (input: { headers: Headers }) => Promise<unknown>;
  };
  $Infer: {
    Session: {
      session: { id: string; userId: string; expiresAt: Date };
      user: {
        id: string;
        email: string;
        emailVerified: boolean;
        name: string | null;
        image: string | null;
        createdAt: Date | string;
        coins?: number | null;
        role?: string | null;
      };
    };
  };
};

export const auth: AuthApi = betterAuth({
  baseURL,
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://paws-esport.com',
    'https://www.paws-esport.com',
  ],
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      coins: { type: 'number', required: false, defaultValue: 1000, input: false },
      favoriteTeamId: { type: 'number', required: false, input: false },
    },
  },
  plugins: [admin({ defaultRole: 'user', adminRoles: ['admin'] })],
}) as unknown as AuthApi;

export type AuthSession = AuthApi['$Infer']['Session'];
export type AuthUser = AuthSession['user'];
