/**
 * Admin Utilities
 * 
 * Helper functions for admin operations
 * 
 * Roles:
 * - user: Regular user
 * - bet_manager: Can only manage bets
 * - admin: Full access
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Roles that can manage bets
const BET_MANAGER_ROLES = ["admin", "bet_manager"];
// Roles that can manage users
const ADMIN_ROLES = ["admin"];

/**
 * Get current session with role info
 */
export async function getSessionWithRole() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    const user = session.user as { role?: string };
    return {
        ...session,
        userRole: user.role || "user",
    };
}

/**
 * Check if user can manage bets (admin or bet_manager)
 */
export async function getBetManagerSession() {
    const session = await getSessionWithRole();

    if (!session || !BET_MANAGER_ROLES.includes(session.userRole)) {
        return null;
    }

    return session;
}

/**
 * Check if the current user is an admin (full access)
 */
export async function getAdminSession() {
    const session = await getSessionWithRole();

    if (!session || !ADMIN_ROLES.includes(session.userRole)) {
        return null;
    }

    return session;
}

/**
 * Middleware for bet management routes (admin or bet_manager)
 */
export async function requireBetManager<T>(
    handler: (session: NonNullable<Awaited<ReturnType<typeof getBetManagerSession>>>) => Promise<T>
): Promise<T | NextResponse> {
    const session = await getBetManagerSession();

    if (!session) {
        return NextResponse.json(
            { error: "Accès non autorisé. Rôle bet_manager ou admin requis." },
            { status: 403 }
        );
    }

    return handler(session);
}

/**
 * Middleware wrapper for admin-only API routes (full access)
 */
export async function requireAdmin<T>(
    handler: (session: NonNullable<Awaited<ReturnType<typeof getAdminSession>>>) => Promise<T>
): Promise<T | NextResponse> {
    const session = await getAdminSession();

    if (!session) {
        return NextResponse.json(
            { error: "Accès non autorisé. Rôle admin requis." },
            { status: 403 }
        );
    }

    return handler(session);
}

/**
 * Check if user can manage bets (for client-side use)
 */
export function canManageBets(role?: string): boolean {
    return BET_MANAGER_ROLES.includes(role || "");
}

/**
 * Check if user is admin (for client-side use)
 */
export function isAdmin(role?: string): boolean {
    return ADMIN_ROLES.includes(role || "");
}

/**
 * Default bet templates for quick creation
 */
export const BET_TEMPLATES = {
    balanced: {
        name: "Équilibré",
        description: "Match 50/50 entre deux équipes de niveau similaire",
        team1Odds: 1.90,
        team2Odds: 1.90,
    },
    favorite: {
        name: "Favori vs Outsider",
        description: "Une équipe favorite face à un outsider",
        team1Odds: 1.40,
        team2Odds: 2.80,
    },
    slight_favorite: {
        name: "Léger avantage",
        description: "Match équilibré avec un léger avantage",
        team1Odds: 1.65,
        team2Odds: 2.20,
    },
    underdog: {
        name: "Outsider",
        description: "L'équipe 2 est l'outsider avec de bonnes cotes",
        team1Odds: 1.30,
        team2Odds: 3.50,
    },
} as const;

