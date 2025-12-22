"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="w-10 h-10 rounded-md border border-card-border bg-card text-muted flex items-center justify-center">
                <span className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative w-10 h-10 rounded-md border border-card-border bg-card hover:bg-card/80 hover:border-primary/50 text-foreground transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            <Sun
                className={`h-5 w-5 transition-all duration-300 absolute ${theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
                    }`}
                aria-hidden="true"
            />
            <Moon
                className={`h-5 w-5 transition-all duration-300 absolute ${theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
                    }`}
                aria-hidden="true"
            />
        </button>
    );
}
