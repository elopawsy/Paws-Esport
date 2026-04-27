"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { X, Mail, Lock, User, Loader2 } from "lucide-react";
import Link from "next/link";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = "login" | "register";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>("login");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setError(null);
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        resetForm();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await signIn.email({
                email,
                password,
            });

            console.log("Sign in result:", result);

            if (result.error) {
                const errorMessage = result.error.message || result.error.code || "Une erreur est survenue";
                console.error("Sign in error:", result.error);
                setError(errorMessage);
            } else {
                onClose();
                resetForm();
                // Force refresh to update UI
                window.location.reload();
            }
        } catch (err) {
            console.error("Sign in exception:", err);
            setError("An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            const result = await signUp.email({
                email,
                password,
                name: name || email.split("@")[0],
            });

            if (result.error) {
                setError(result.error.message || "Une erreur est survenue");
            } else {
                onClose();
                resetForm();
                // Force refresh to update UI
                window.location.reload();
            }
        } catch {
            setError("An error occurred during registration");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="relative bg-card border border-card-border rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                    aria-label="Close authentication modal"
                >
                    <X className="w-5 h-5" aria-hidden="true" />
                </button>

                {/* Header with tabs */}
                <div className="flex border-b border-card-border" role="tablist" aria-label="Authentication options">
                    <button
                        onClick={() => handleTabChange("login")}
                        className={`flex-1 py-4 text-sm font-medium tracking-wide transition-colors ${activeTab === "login"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        role="tab"
                        aria-selected={activeTab === "login"}
                        aria-controls="auth-form"
                        id="login-tab"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => handleTabChange("register")}
                        className={`flex-1 py-4 text-sm font-medium tracking-wide transition-colors ${activeTab === "register"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        role="tab"
                        aria-selected={activeTab === "register"}
                        aria-controls="auth-form"
                        id="register-tab"
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={activeTab === "login" ? handleLogin : handleRegister}
                    className="p-6 space-y-4"
                    id="auth-form"
                    role="tabpanel"
                    aria-labelledby={activeTab === "login" ? "login-tab" : "register-tab"}
                >
                    <h2 id="auth-modal-title" className="sr-only">
                        {activeTab === "login" ? "Login to your account" : "Create a new account"}
                    </h2>
                    
                    {/* Error message */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-md" role="alert" aria-live="polite">
                            {error}
                        </div>
                    )}

                    {/* Name field (register only) */}
                    {activeTab === "register" && (
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm text-muted-foreground">
                                Username (optional)
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your username"
                                    className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* Email field */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm text-muted-foreground">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
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

                    {/* Password field */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm text-muted-foreground">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
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
                        {/* Forgot Password link (login only) */}
                        {activeTab === "login" && (
                            <div className="text-right">
                                <Link
                                    href="/auth/forgot-password"
                                    onClick={onClose}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Confirm password (register only) */}
                    {activeTab === "register" && (
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm text-muted-foreground">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
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
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                            </>
                        ) : activeTab === "login" ? (
                            "Login"
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
