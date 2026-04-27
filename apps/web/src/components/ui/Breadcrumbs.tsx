import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm text-muted-foreground mb-4", className)}>
            <Link
                href="/"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                title="Home"
            >
                <Home className="w-4 h-4" />
                <span className="sr-only">Home</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-foreground transition-colors truncate max-w-[200px]"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-foreground font-medium truncate max-w-[200px]">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
