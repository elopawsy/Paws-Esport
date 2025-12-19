"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-card-border shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full shrink-0">
                        <Cookie className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg">Cookies & Privacy</h3>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            We use cookies to ensure the best experience on our website. This typically includes identifying you and securing your session.
                            By using our site, you acknowledge that you have read and understood our{" "}
                            <Link href="/privacy" className="text-primary hover:underline font-medium">
                                Privacy Policy
                            </Link>.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleAccept}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-lg transition-colors whitespace-nowrap"
                    >
                        Got it, thanks!
                    </button>
                    <button
                        onClick={handleAccept}
                        className="sm:hidden p-2.5 bg-background border border-card-border hover:bg-card-border/50 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
            </div>
        </div>
    );
}
