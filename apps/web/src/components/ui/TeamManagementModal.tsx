"use client";

import { useState, useEffect, memo, useMemo } from "react";
import { Team } from "@/types";
import CountryFlag from "./CountryFlag";
import Image from "next/image";
import { X, Search, Globe, Eye, EyeOff, Plus, Trash2, RotateCcw } from "lucide-react";

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
    { code: "EU", name: "Europe" },
    { code: "CIS", name: "CIS" },
    { code: "NA", name: "North America" },
    { code: "SA", name: "South America" },
    { code: "ASIA", name: "Asia" },
    { code: "OCE", name: "Oceania" },
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
        <div className={`flex items-center gap-3 p-3 border-b border-card-border transition-colors ${isHidden ? "opacity-50 bg-red-500/5 hover:opacity-100" : "hover:bg-secondary/50"}`}>
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative bg-secondary rounded-md p-1 border border-card-border">
                {team.image_url ? (
                    <Image src={team.image_url} alt="" fill className="object-contain p-0.5" sizes="32px" />
                ) : (
                    <span className="text-xs font-bold text-muted-foreground">{team.name.charAt(0)}</span>
                )}
            </div>
            <CountryFlag code={team.location} size="sm" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{team.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                    {team.players?.length || 0} Players
                </p>
            </div>
            {isHidden ? (
                <button
                    onClick={onRestore}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary hover:text-white transition-colors"
                >
                    <Eye className="w-3 h-3" />
                    Show
                </button>
            ) : (
                <button
                    onClick={onRemove}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-muted-foreground text-xs font-bold hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                >
                    <EyeOff className="w-3 h-3" />
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
        <div className="flex items-center gap-3 p-3 hover:bg-secondary/50 cursor-pointer rounded-lg border border-transparent hover:border-card-border transition-all" onClick={onAdd}>
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative bg-secondary rounded-md p-1 border border-card-border">
                {team.image_url ? (
                    <Image src={team.image_url} alt="" fill className="object-contain p-0.5" sizes="32px" />
                ) : (
                    <span className="text-[10px] font-bold text-muted-foreground">{team.name.charAt(0)}</span>
                )}
            </div>
            <CountryFlag code={team.location} size="sm" />
            <span className="flex-1 text-sm font-bold text-foreground truncate">{team.name}</span>
            <span className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">
                <Plus className="w-3 h-3" />
                Add
            </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-card border border-card-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-card-border flex items-center justify-between bg-white/5 rounded-t-xl">
                    <h2 className="font-display font-bold text-lg uppercase tracking-wide text-foreground flex items-center gap-2">
                        Team Management
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-3 border-b border-card-border flex gap-2 bg-secondary/20">
                    <button
                        onClick={() => setActiveTab("current")}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "current" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"}`}
                    >
                        Current Teams ({visibleTeams.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("search")}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "search" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"}`}
                    >
                        Add Team
                    </button>
                    {hiddenTeamsList.length > 0 && (
                        <span className="ml-auto text-[10px] text-muted-foreground font-bold uppercase tracking-widest self-center bg-red-500/10 text-red-500 px-2 py-1 rounded">
                            {hiddenTeamsList.length} Hidden
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent">
                    {activeTab === "current" ? (
                        <>
                            {/* Region filter */}
                            <div className="px-6 py-4 border-b border-card-border bg-background/50 sticky top-0 z-10 backdrop-blur-sm">
                                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-2 flex items-center gap-1.5">
                                    <Globe className="w-3 h-3" />
                                    Filter by Region
                                </label>
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => setSelectedRegion(e.target.value)}
                                    className="w-full px-3 py-2 bg-secondary border border-card-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors font-medium"
                                >
                                    {REGIONS.map(r => (
                                        <option key={r.code} value={r.code}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Teams list */}
                            <div className="divide-y divide-card-border p-2">
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
                                    <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                                        <Search className="w-8 h-8 mb-3 opacity-20" />
                                        <p className="text-xs uppercase tracking-widest font-bold">
                                            No teams in this region
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Hidden teams */}
                            {hiddenTeamsList.length > 0 && (
                                <>
                                    <div className="px-6 py-2 bg-red-500/10 border-y border-red-500/20 sticky top-0 z-10 backdrop-blur-sm">
                                        <span className="text-xs text-red-400 uppercase tracking-wider font-bold flex items-center gap-2">
                                            <EyeOff className="w-3 h-3" />
                                            Hidden Teams ({hiddenTeamsList.length})
                                        </span>
                                    </div>
                                    <div className="divide-y divide-card-border p-2 bg-red-500/5">
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
                            <div className="px-6 py-4 border-b border-card-border bg-background/50 sticky top-0 z-10 backdrop-blur-sm">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search for a team..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-secondary border border-card-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Search results */}
                            <div className="p-4">
                                {searching && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <RotateCcw className="w-6 h-6 text-primary animate-spin mb-2" />
                                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Searching...</p>
                                    </div>
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
                                    <div className="py-8 text-center text-muted-foreground">
                                        <p className="text-xs uppercase tracking-widest font-bold">
                                            No team found
                                        </p>
                                    </div>
                                )}

                                {searchQuery.length < 2 && (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <p className="text-xs font-medium">
                                            Enter at least 2 characters to search
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-card-border bg-white/5 flex justify-end rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
