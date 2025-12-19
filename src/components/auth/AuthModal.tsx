"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { X, Mail, Lock, User, Loader2 } from "lucide-react";

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

            if (result.error) {
                setError(result.error.message || "Une erreur est survenue");
            } else {
                onClose();
                resetForm();
                // Force refresh to update UI
                window.location.reload();
            }
        } catch {
            setError("Une erreur est survenue lors de la connexion");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères");
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
            setError("Une erreur est survenue lors de l'inscription");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-card-border rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header with tabs */}
                <div className="flex border-b border-card-border">
                    <button
                        onClick={() => handleTabChange("login")}
                        className={`flex-1 py-4 text-sm font-medium tracking-wide transition-colors ${activeTab === "login"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Connexion
                    </button>
                    <button
                        onClick={() => handleTabChange("register")}
                        className={`flex-1 py-4 text-sm font-medium tracking-wide transition-colors ${activeTab === "register"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Inscription
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={activeTab === "login" ? handleLogin : handleRegister}
                    className="p-6 space-y-4"
                >
                    {/* Error message */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Name field (register only) */}
                    {activeTab === "register" && (
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm text-muted-foreground">
                                Pseudo (optionnel)
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ton pseudo"
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
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ton@email.com"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm text-muted-foreground">
                            Mot de passe
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

                    {/* Confirm password (register only) */}
                    {activeTab === "register" && (
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm text-muted-foreground">
                                Confirmer le mot de passe
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
                                Chargement...
                            </>
                        ) : activeTab === "login" ? (
                            "Se connecter"
                        ) : (
                            "S'inscrire"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
