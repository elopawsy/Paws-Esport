import { Metadata } from "next";
import { History, Sparkles, Bug, Wrench, Zap, Clock } from "lucide-react";

export const metadata: Metadata = {
    title: "Changelog",
    description: "Latest updates and improvements to PawsEsport",
};

interface ChangelogEntry {
    version: string;
    date: string;
    title: string;
    type: "feature" | "improvement" | "fix" | "breaking";
    changes: {
        category: "new" | "improved" | "fixed";
        items: string[];
    }[];
}

const changelog: ChangelogEntry[] = [
    {
        version: "1.3.0",
        date: "December 26, 2025",
        title: "Minigames & Tier List Update",
        type: "feature",
        changes: [
            {
                category: "new",
                items: [
                    "Tier List - Create and share your team tier lists",
                    "Drag & drop interface for ranking teams",
                    "Export tier list as image",
                    "Per-game tier list with local save",
                ],
            },
            {
                category: "improved",
                items: [
                    "Navigation restructured - Simulator and Tier List grouped under Minigames",
                    "Minigames dropdown now shows descriptions",
                ],
            },
        ],
    },
    {
        version: "1.2.0",
        date: "December 22, 2025",
        title: "Accessibility & Focus Update",
        type: "improvement",
        changes: [
            {
                category: "new",
                items: [
                    "Skip-to-content link for keyboard navigation",
                    "My Teams filter on Calendar page",
                    "Screen reader support across all components",
                ],
            },
            {
                category: "improved",
                items: [
                    "Focus indicators on all interactive elements",
                    "ARIA labels on buttons, modals, and dropdowns",
                    "Reduced motion support for users who prefer it",
                    "High contrast mode compatibility",
                    "Game selection limited to CS2, Valorant, and League of Legends",
                ],
            },
            {
                category: "fixed",
                items: [
                    "Game selection properly updates match list",
                ],
            },
        ],
    },
    {
        version: "1.1.0",
        date: "December 20, 2025",
        title: "Caching & Performance",
        type: "improvement",
        changes: [
            {
                category: "improved",
                items: [
                    "Intelligent API caching based on data type",
                    "Homepage converted to Server Component for faster loads",
                    "Optimized tournament and match data fetching",
                ],
            },
            {
                category: "fixed",
                items: [
                    "Removed deprecated PandaScore SDK dependency",
                    "Fixed build issues with external packages",
                ],
            },
        ],
    },
    {
        version: "1.0.0",
        date: "December 15, 2025",
        title: "Initial Release",
        type: "feature",
        changes: [
            {
                category: "new",
                items: [
                    "Real-time match tracking for CS2, Valorant, and LoL",
                    "Tournament brackets and standings",
                    "Team and player profiles",
                    "Transfer simulator with drag & drop",
                    "Esportsle guessing game",
                    "Match calendar with game filtering",
                    "User accounts with tracked teams",
                    "Betting system with virtual coins",
                    "Leaderboard for top bettors",
                    "Dark and light theme support",
                ],
            },
        ],
    },
];

const categoryConfig = {
    new: { icon: Sparkles, label: "New", color: "text-green-500" },
    improved: { icon: Zap, label: "Improved", color: "text-blue-500" },
    fixed: { icon: Bug, label: "Fixed", color: "text-amber-500" },
};

const typeConfig = {
    feature: { color: "bg-green-500/20 text-green-500 border-green-500/30" },
    improvement: { color: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
    fix: { color: "bg-amber-500/20 text-amber-500 border-amber-500/30" },
    breaking: { color: "bg-red-500/20 text-red-500 border-red-500/30" },
};

export default function ChangelogPage() {
    return (
        <div className="container-custom py-12">
            {/* Header */}
            <section className="mb-12 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
                    <History className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-foreground mb-4">
                    Changelog
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Stay up to date with the latest features, improvements, and bug fixes.
                </p>
            </section>

            {/* Timeline */}
            <section className="max-w-3xl mx-auto">
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-card-border hidden md:block" aria-hidden="true" />

                    {/* Entries */}
                    <div className="space-y-12">
                        {changelog.map((entry, index) => (
                            <article
                                key={entry.version}
                                className="relative"
                            >
                                {/* Timeline dot */}
                                <div className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background hidden md:block" aria-hidden="true" />

                                {/* Content */}
                                <div className="md:ml-16 bg-card border border-card-border rounded-xl overflow-hidden">
                                    {/* Header */}
                                    <div className="px-6 py-4 border-b border-card-border bg-secondary/30">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="text-xl font-display font-bold text-primary">
                                                v{entry.version}
                                            </span>
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${typeConfig[entry.type].color}`}>
                                                {entry.type}
                                            </span>
                                        </div>
                                        <h2 className="text-lg font-bold text-foreground">
                                            {entry.title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Clock className="w-4 h-4" aria-hidden="true" />
                                            <time dateTime={entry.date}>{entry.date}</time>
                                        </div>
                                    </div>

                                    {/* Changes */}
                                    <div className="px-6 py-4 space-y-4">
                                        {entry.changes.map((changeGroup) => {
                                            const config = categoryConfig[changeGroup.category];
                                            const Icon = config.icon;

                                            return (
                                                <div key={changeGroup.category}>
                                                    <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-2 ${config.color}`}>
                                                        <Icon className="w-4 h-4" aria-hidden="true" />
                                                        {config.label}
                                                    </div>
                                                    <ul className="space-y-1.5 ml-6">
                                                        {changeGroup.items.map((item, itemIndex) => (
                                                            <li
                                                                key={itemIndex}
                                                                className="text-sm text-foreground relative before:content-['•'] before:absolute before:-left-4 before:text-muted-foreground"
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="mt-16 text-center">
                <div className="bg-card border border-card-border rounded-xl p-8 max-w-2xl mx-auto">
                    <Wrench className="w-10 h-10 text-primary mx-auto mb-4" aria-hidden="true" />
                    <h2 className="text-xl font-display font-bold uppercase mb-2">
                        Have Feedback?
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        We&apos;re always looking to improve. Let us know if you have suggestions or find any issues.
                    </p>
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg transition-colors"
                    >
                        Open an Issue on GitHub
                    </a>
                </div>
            </section>
        </div>
    );
}
