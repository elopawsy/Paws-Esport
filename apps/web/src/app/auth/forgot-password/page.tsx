"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await requestPasswordReset({
                email,
                redirectTo: "/auth/reset-password",
            });

            if (result.error) {
                setError(result.error.message || "An error occurred.");
            } else {
                setIsSubmitted(true);
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md bg-card border border-card-border rounded-lg p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-foreground mb-2">
                        Check your email
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        We&apos;ve sent a password reset link to <strong>{email}</strong>.
                        Please check your inbox and follow the instructions.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                        Didn&apos;t receive the email? Check your spam folder or try again.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md bg-card border border-card-border rounded-lg p-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>

                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Forgot your password?
                </h1>
                <p className="text-muted-foreground mb-6">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm text-muted-foreground">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
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
                                Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
