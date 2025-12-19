/**
 * Better Auth Client
 * 
 * React client for interacting with auth endpoints
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // No baseURL needed since we're on the same domain
});

// Export commonly used hooks and methods
export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
    // Password reset
    requestPasswordReset,
    resetPassword,
    // Email verification
    sendVerificationEmail,
} = authClient;


