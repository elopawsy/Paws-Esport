import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-card-border bg-card mt-auto">
            <div className="container-custom py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-xl font-display font-bold text-primary">PawsEsport</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            © {new Date().getFullYear()} Transfer Simulator. All rights reserved.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="/privacy" className="hover:text-primary transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="hover:text-primary transition-colors">
                            Terms of Service
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-primary">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-primary">
                            <Github className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
