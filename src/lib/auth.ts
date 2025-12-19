/**
 * Better Auth Configuration
 * 
 * Server-side auth instance with Prisma adapter and email support
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma";
import { sendEmail } from "./resend";
import { verificationEmailTemplate, passwordResetEmailTemplate } from "./email-templates";

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
});

// Base URL for production/development
const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const auth = betterAuth({
    baseURL,
    trustedOrigins: [
        "http://localhost:3000",
        "https://paws-esport.com",
        "https://www.paws-esport.com",
    ],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        // Minimum password length
        minPasswordLength: 8,
        // Password reset handler
        sendResetPassword: async ({ user, url }) => {
            void sendEmail({
                to: user.email,
                subject: "Reset your password - Paws Esport",
                html: passwordResetEmailTemplate({
                    url,
                    userName: user.name || user.email.split("@")[0],
                }),
            });
        },
    },
    emailVerification: {
        // Send verification email on signup
        sendVerificationEmail: async ({ user, url }) => {
            void sendEmail({
                to: user.email,
                subject: "Verify your email - Paws Esport",
                html: verificationEmailTemplate({
                    url,
                    userName: user.name || user.email.split("@")[0],
                }),
            });
        },
        // Auto sign in after email verification
        autoSignInAfterVerification: true,
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

