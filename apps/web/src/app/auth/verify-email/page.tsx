"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link. No token provided.");
            return;
        }

        const verifyEmail = async () => {
            try {
                const result = await authClient.verifyEmail({
                    query: { token },
                });

                if (result.error) {
                    setStatus("error");
                    setMessage(result.error.message || "Failed to verify email.");
                } else {
                    setStatus("success");
                    setMessage("Your email has been verified successfully!");
                    // Redirect to home after 3 seconds
                    setTimeout(() => {
                        router.push("/");
                    }, 3000);
                }
            } catch {
                setStatus("error");
                setMessage("An error occurred during verification.");
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    if (status === "loading") {
        return (
            <div className="w-full max-w-md bg-card border border-card-border rounded-lg p-8 text-center">
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                <h1 className="text-xl font-semibold text-foreground mb-2">
                    Verifying your email...
                </h1>
                <p className="text-muted-foreground">
                    Please wait while we verify your email address.
                </p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="w-full max-w-md bg-card border border-card-border rounded-lg p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-foreground mb-2">
                    Email Verified!
                </h1>
                <p className="text-muted-foreground mb-6">
                    {message}
                </p>
                <p className="text-sm text-muted-foreground">
                    Redirecting to homepage...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-card border border-card-border rounded-lg p-8 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">
                Verification Failed
            </h1>
            <p className="text-muted-foreground mb-6">
                {message}
            </p>
            <Link
                href="/"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
            >
                Back to Home
            </Link>
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

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Suspense fallback={<LoadingSpinner />}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
