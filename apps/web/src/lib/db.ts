/**
 * Prisma Database Client
 * 
 * Singleton pattern for Prisma Client to prevent too many connections
 * in development mode with hot-reloading.
 * 
 * Prisma 7.x with "client" engine requires accelerateUrl to be passed.
 */

import { PrismaClient } from '@paws/db';

// Create a function to get the Prisma client lazily
function createPrismaClient() {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        // Prisma 7.x requires accelerateUrl for "client" engine type
        accelerateUrl: process.env.DATABASE_URL,
    });
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Lazy initialization - only create client when first accessed
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
