"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";
import { Lock, Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"form" | "success" | "error">("form");
    const [error, setError] = useState<string | null>(null);

    // Check if token is present
    if (!token && status === "form") {
        return (
            <div className="w-full max-w-md bg-card border border-card-border rounded-lg p-8 text-center">
                <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-foreground mb-2">
                    Invalid Reset Link
                </h1>
                <p className="text-muted-foreground mb-6">
                    This password reset link is invalid or has expired.
                </p>
                <Link
                    href="/auth/forgot-password"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
                >
                    Request New Link
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await resetPassword({
                newPassword: password,
                token: token!,
            });

            if (result.error) {
                setStatus("error");
                setError(result.error.message || "Failed to reset password.");
            } else {
                setStatus("success");
                // Redirect to home after 3 seconds
                setTimeout(() => {
                    router.push("/");
                }, 3000);
            }
        } catch {
            setStatus("error");
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "success") {
        return (
            <div className="w-full max-w-md bg-card border border-card-border rounded-lg p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-foreground mb-2">
                    Password Reset!
                </h1>
                <p className="text-muted-foreground mb-6">
                    Your password has been successfully reset. You can now log in with your new password.
                </p>
                <p className="text-sm text-muted-foreground">
                    Redirecting to homepage...
                </p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="w-full max-w-md bg-card border border-card-border rounded-lg p-8 text-center">
                <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-foreground mb-2">
                    Reset Failed
                </h1>
                <p className="text-muted-foreground mb-6">
                    {error}
                </p>
                <Link
                    href="/auth/forgot-password"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
                >
                    Try Again
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-card border border-card-border rounded-lg p-8">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </Link>

            <h1 className="text-2xl font-semibold text-foreground mb-2">
                Reset your password
            </h1>
            <p className="text-muted-foreground mb-6">
                Enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm text-muted-foreground">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm text-muted-foreground">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Resetting...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </button>
            </form>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="w-full max-w-md bg-card border border-card-border rounded-lg p-8 text-center">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Suspense fallback={<LoadingSpinner />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}

