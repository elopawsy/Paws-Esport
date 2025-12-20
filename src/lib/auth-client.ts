/**
 * Better Auth Client
 * 
 * React client for interacting with auth endpoints
 */

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    // No baseURL needed since we're on the same domain
    plugins: [
        adminClient()
    ]
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


