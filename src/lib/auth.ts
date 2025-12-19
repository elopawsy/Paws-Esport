/**
 * Better Auth Configuration
 * 
 * Server-side auth instance with Prisma adapter
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        // Minimum password length
        minPasswordLength: 8,
    },
    session: {
        // Session expires after 7 days
        expiresIn: 60 * 60 * 24 * 7,
        // Refresh session if less than 1 day left
        updateAge: 60 * 60 * 24,
    },
    user: {
        // Additional user fields
        additionalFields: {
            coins: {
                type: "number",
                required: false,
                defaultValue: 1000,
                input: false, // Not settable by user during signup
            },
            favoriteTeamId: {
                type: "number",
                required: false,
                input: false,
            },
        },
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
