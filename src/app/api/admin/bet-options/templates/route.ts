/**
 * Admin Bet Templates API
 * 
 * Returns suggested bet templates for quick creation
 */

import { requireBetManager, BET_TEMPLATES } from "@/lib/admin";
import { NextResponse } from "next/server";

// GET: Get available bet templates
export async function GET() {
    return requireBetManager(async () => {
        return NextResponse.json({
            templates: Object.entries(BET_TEMPLATES).map(([key, template]) => ({
                id: key,
                ...template,
            })),
        });
    });
}
