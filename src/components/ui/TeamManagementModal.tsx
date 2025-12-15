"use client";

import { useState, useEffect, memo, useMemo } from "react";
import { Team } from "@/lib/types";
import CountryFlag, { CS2_COUNTRIES, COUNTRY_FLAGS } from "./CountryFlag";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    teams: Team[];
    hiddenTeams: Set<number>;
    onAddTeam: (team: Team) => void;
    onRemoveTeam: (teamId: number) => void;
    onRestoreTeam: (teamId: number) => void;
}

// Regions for filtering
const REGIONS = [
    { code: "ALL", name: "All Regions" },
    { code: "EU", name: "🇪🇺 Europe" },
    { code: "CIS", name: "🇷🇺 CIS" },
    { code: "NA", name: "🇺🇸 North America" },
    { code: "SA", name: "🇧🇷 South America" },
    { code: "ASIA", name: "🇨🇳 Asia" },
    { code: "OCE", name: "🇦🇺 Oceania" },
];

// Map country codes to regions
const COUNTRY_REGION_MAP: Record<string, string> = {
    // EU
    FR: "EU", DE: "EU", DK: "EU", SE: "EU", PL: "EU", FI: "EU", NO: "EU", NL: "EU",
    BE: "EU", ES: "EU", IT: "EU", PT: "EU", GB: "EU", UK: "EU", IE: "EU", AT: "EU",
    CH: "EU", CZ: "EU", SK: "EU", HU: "EU", RO: "EU", BG: "EU", GR: "EU", HR: "EU",
    RS: "EU", BA: "EU", SI: "EU", MK: "EU", ME: "EU", AL: "EU", XK: "EU", LV: "EU",
    LT: "EU", EE: "EU", TR: "EU", IL: "EU",
    // CIS
    RU: "CIS", UA: "CIS", BY: "CIS", KZ: "CIS", UZ: "CIS", MN: "CIS",
    // NA
    US: "NA", CA: "NA", MX: "NA",
    // SA
    BR: "SA", AR: "SA", CL: "SA", CO: "SA", PE: "SA", VE: "SA", UY: "SA", GT: "SA",
    // Asia
    CN: "ASIA", JP: "ASIA", KR: "ASIA", TW: "ASIA", VN: "ASIA", TH: "ASIA",
    MY: "ASIA", SG: "ASIA", ID: "ASIA", PH: "ASIA", IN: "ASIA", PK: "ASIA",
    SA: "ASIA", AE: "ASIA", JO: "ASIA", LB: "ASIA",
    // OCE
    AU: "OCE", NZ: "OCE",
};

const TeamRow = memo(function TeamRow({
    team,
    isHidden,
    onRemove,
    onRestore
}: {
    team: Team;
    isHidden: boolean;
    onRemove: () => void;
    onRestore: () => void;
}) {
    return (
        <div className={`flex items-center gap-3 p-3 border-b border-card-border transition-colors ${isHidden ? "opacity-50 bg-red-500/5" : "hover:bg-white/5"}`}>
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                {team.image_url ? (
                    <img src={team.image_url} alt="" className="w-full h-full object-contain" />
                ) : (
                    <span className="text-xs font-bold text-muted">{team.name.charAt(0)}</span>
                )}
            </div>
            <CountryFlag code={team.location} size="sm" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{team.name}</p>
                <p className="text-[10px] text-muted uppercase tracking-wide">
                    {team.players?.length || 0} Players
                </p>
            </div>
            {isHidden ? (
                <button
                    onClick={onRestore}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-sm hover:bg-primary hover:text-white transition-colors"
                >
                    Restore
                </button>
            ) : (
                <button
                    onClick={onRemove}
                    className="px-2 py-1 text-muted text-xs hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                >
                    Hide
                </button>
            )}
        </div>
    );
});

const SearchResultRow = memo(function SearchResultRow({
    team,
    onAdd,
}: {
    team: Team;
    onAdd: () => void;
}) {
    return (
        <div className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer rounded-sm" onClick={onAdd}>
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                {team.image_url ? (
                    <img src={team.image_url} alt="" className="w-full h-full object-contain" />
                ) : (
                    <span className="text-[10px] font-bold text-muted">{team.name.charAt(0)}</span>
                )}
            </div>
            <CountryFlag code={team.location} size="sm" />
            <span className="flex-1 text-sm font-medium text-foreground truncate">{team.name}</span>
            <span className="text-xs text-primary">+ Add</span>
        </div>
    );
});

export default function TeamManagementModal({
    isOpen,
    onClose,
    teams,
    hiddenTeams,
    onAddTeam,
    onRemoveTeam,
    onRestoreTeam,
}: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Team[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState("ALL");
    const [activeTab, setActiveTab] = useState<"current" | "search">("current");

    // Filter current teams by region
    const filteredTeams = useMemo(() => {
        if (selectedRegion === "ALL") return teams;
        return teams.filter(t => {
            const location = t.location?.toUpperCase() || "EU";
            return COUNTRY_REGION_MAP[location] === selectedRegion;
        });
    }, [teams, selectedRegion]);

    // Hidden teams list
    const hiddenTeamsList = useMemo(() => {
        return teams.filter(t => hiddenTeams.has(t.id));
    }, [teams, hiddenTeams]);

    // Visible teams
    const visibleTeams = useMemo(() => {
        return filteredTeams.filter(t => !hiddenTeams.has(t.id));
    }, [filteredTeams, hiddenTeams]);

    // Debounced search
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/teams/search?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter out teams already in the list
                    const existingIds = new Set(teams.map(t => t.id));
                    setSearchResults(data.filter((t: Team) => !existingIds.has(t.id)));
                }
            } catch { }
            setSearching(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, teams]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-card border border-card-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-card-border flex items-center justify-between bg-white/5">
                    <h2 className="font-display font-semibold text-lg uppercase tracking-wide text-foreground">
                        Team Management
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-foreground transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-2 border-b border-card-border flex gap-2">
                    <button
                        onClick={() => setActiveTab("current")}
                        className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors ${activeTab === "current" ? "bg-primary text-white" : "text-muted hover:text-foreground hover:bg-white/5"}`}
                    >
                        Current Teams ({visibleTeams.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("search")}
                        className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors ${activeTab === "search" ? "bg-primary text-white" : "text-muted hover:text-foreground hover:bg-white/5"}`}
                    >
                        Add Team
                    </button>
                    {hiddenTeamsList.length > 0 && (
                        <span className="ml-auto text-[10px] text-muted self-center">
                            {hiddenTeamsList.length} hidden
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === "current" ? (
                        <>
                            {/* Region filter */}
                            <div className="px-6 py-3 border-b border-card-border bg-background/50">
                                <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">Filter by Region</label>
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => setSelectedRegion(e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-card-border rounded-sm text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                >
                                    {REGIONS.map(r => (
                                        <option key={r.code} value={r.code}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Teams list */}
                            <div className="divide-y divide-card-border">
                                {visibleTeams.map(team => (
                                    <TeamRow
                                        key={team.id}
                                        team={team}
                                        isHidden={false}
                                        onRemove={() => onRemoveTeam(team.id)}
                                        onRestore={() => { }}
                                    />
                                ))}
                                {visibleTeams.length === 0 && (
                                    <p className="py-8 text-center text-muted text-xs uppercase tracking-widest">
                                        No teams in this region
                                    </p>
                                )}
                            </div>

                            {/* Hidden teams */}
                            {hiddenTeamsList.length > 0 && (
                                <>
                                    <div className="px-6 py-2 bg-red-500/10 border-y border-red-500/20">
                                        <span className="text-xs text-red-400 uppercase tracking-wider font-medium">
                                            Hidden Teams ({hiddenTeamsList.length})
                                        </span>
                                    </div>
                                    <div className="divide-y divide-card-border">
                                        {hiddenTeamsList.map(team => (
                                            <TeamRow
                                                key={team.id}
                                                team={team}
                                                isHidden={true}
                                                onRemove={() => { }}
                                                onRestore={() => onRestoreTeam(team.id)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Search */}
                            <div className="px-6 py-4 border-b border-card-border bg-background/50">
                                <input
                                    type="text"
                                    placeholder="Search teams..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-card-border rounded-sm text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
                                    autoFocus
                                />
                            </div>

                            {/* Search results */}
                            <div className="p-4">
                                {searching && (
                                    <p className="text-center text-muted text-xs py-4">Searching...</p>
                                )}

                                {!searching && searchResults.length > 0 && (
                                    <div className="space-y-1">
                                        {searchResults.slice(0, 15).map(team => (
                                            <SearchResultRow
                                                key={team.id}
                                                team={team}
                                                onAdd={() => {
                                                    onAddTeam(team);
                                                    setSearchQuery("");
                                                    setSearchResults([]);
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                                    <p className="text-center text-muted text-xs uppercase tracking-widest py-4">
                                        No teams found
                                    </p>
                                )}

                                {searchQuery.length < 2 && (
                                    <p className="text-center text-muted text-xs py-8">
                                        Enter at least 2 characters to search
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-card-border bg-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary text-white text-xs font-medium uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
