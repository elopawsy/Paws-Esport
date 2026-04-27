import Link from "next/link";
import { Github, Twitter } from "lucide-react";

import TrpcStatusBadge from "@/components/demo/TrpcStatusBadge";

export default function Footer() {
    return (
        <footer className="border-t border-border-subtle bg-surface mt-auto" role="contentinfo">
            <div className="container-custom py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 text-center md:text-left">
                        <span className="font-display text-base font-semibold uppercase tracking-[0.04em]">
                            <span className="text-primary">Paws</span>
                            <span className="text-foreground">Esport</span>
                        </span>
                        <span className="hidden md:inline text-border-strong">|</span>
                        <p className="text-xs text-muted">
                            © {new Date().getFullYear()} All rights reserved.
                        </p>
                    </div>

                    <nav aria-label="Footer navigation" className="flex items-center gap-5 text-xs uppercase tracking-wide text-muted">
                        <Link href="/changelog" className="hover:text-primary transition-colors">
                            Changelog
                        </Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">
                            Privacy
                        </Link>
                        <Link href="#" className="hover:text-primary transition-colors">
                            Terms
                        </Link>
                        <TrpcStatusBadge />
                    </nav>

                    <div className="flex items-center gap-1" role="group" aria-label="Social media links">
                        <Link
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted hover:text-primary hover:bg-surface-2 transition-colors"
                            aria-label="Follow us on Twitter (opens in new tab)"
                        >
                            <Twitter className="w-4 h-4" aria-hidden="true" />
                        </Link>
                        <Link
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted hover:text-primary hover:bg-surface-2 transition-colors"
                            aria-label="View our GitHub (opens in new tab)"
                        >
                            <Github className="w-4 h-4" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
