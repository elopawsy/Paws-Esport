/**
 * Better Auth API Route Handler
 * 
 * Handles all auth-related API requests at /api/auth/*
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
