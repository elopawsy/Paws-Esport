// PandaScore API Client for CS2
// Free tier: 1000 requests/hour

const PANDASCORE_BASE_URL = "https://api.pandascore.co";

// Correct PandaScore IDs for Top CS2 teams (verified December 2024)
const TOP_TEAM_IDS = [
    3216,   // Natus Vincere
    3210,   // G2
    3455,   // Vitality
    3240,   // MOUZ
    3212,   // FaZe
    3234,   // Heroic
    124530, // FURIA
    3310,   // Complexity
    3213,   // Liquid
    3249,   // BIG
    129413, // Eternal Fire
    3288,   // Virtus.pro
    3223,   // Cloud9
    125847, // GamerLegion  
    131216, // Falcons
    133458, // BetBoom Team
    3218,   // NIP (Ninjas in Pyjamas)
];

// Simple in-memory cache
interface CacheEntry<T> {
    data: T;
    expiry: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getFromCache<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    return entry.data as T;
}

function setInCache<T>(key: string, data: T): void {
    cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

// Types for PandaScore responses
export interface PandaScoreTeam {
    id: number;
    slug: string;
    name: string;
    acronym: string | null;
    image_url: string | null;
    location: string | null;
    players: PandaScorePlayer[];
}

export interface PandaScorePlayer {
    id: number;
    slug: string;
    name: string;
    first_name: string | null;
    last_name: string | null;
    nationality: string | null;
    image_url: string | null;
    role: string | null;
}

// API fetch helper
async function pandaFetch<T>(
    endpoint: string,
    apiKey: string,
    params?: Record<string, string>
): Promise<T> {
    const url = new URL(`${PANDASCORE_BASE_URL}${endpoint}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const response = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
        },
        next: { revalidate: 600 },
    });

    if (!response.ok) {
        throw new Error(`PandaScore API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Get API key from environment
function getApiKey(): string {
    const apiKey = process.env.PANDASCORE_API_KEY;
    if (!apiKey) {
        throw new Error("PANDASCORE_API_KEY environment variable is not set");
    }
    return apiKey;
}

// Get top CS2 teams with real data from PandaScore
export async function getTopCS2Teams(): Promise<PandaScoreTeam[]> {
    const cacheKey = "cs2-top-teams-v3";
    const cached = getFromCache<PandaScoreTeam[]>(cacheKey);
    if (cached) return cached;

    const apiKey = getApiKey();

    // Fetch teams by ID filter
    const teams = await pandaFetch<PandaScoreTeam[]>("/csgo/teams", apiKey, {
        "filter[id]": TOP_TEAM_IDS.join(","),
        "page[size]": "50",
    });

    // Sort teams by our ranking order
    const sortedTeams = teams.sort((a, b) => {
        const indexA = TOP_TEAM_IDS.indexOf(a.id);
        const indexB = TOP_TEAM_IDS.indexOf(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    setInCache(cacheKey, sortedTeams);
    return sortedTeams;
}

export async function getCS2TeamById(teamId: number): Promise<PandaScoreTeam> {
    const cacheKey = `cs2-team-${teamId}`;
    const cached = getFromCache<PandaScoreTeam>(cacheKey);
    if (cached) return cached;

    const apiKey = getApiKey();
    const team = await pandaFetch<PandaScoreTeam>(`/csgo/teams/${teamId}`, apiKey);

    setInCache(cacheKey, team);
    return team;
}

export async function searchCS2Teams(query: string): Promise<PandaScoreTeam[]> {
    const cacheKey = `cs2-search-${query}`;
    const cached = getFromCache<PandaScoreTeam[]>(cacheKey);
    if (cached) return cached;

    const apiKey = getApiKey();
    const teams = await pandaFetch<PandaScoreTeam[]>("/csgo/teams", apiKey, {
        "search[name]": query,
        "page[size]": "20",
    });

    setInCache(cacheKey, teams);
    return teams;
}

// Helper to convert country name/code to code
export function getCountryCode(country: string | null): string {
    if (!country) return "EU";

    // If already a 2-letter code, return it
    if (country.length === 2) return country.toUpperCase();

    const countryMap: Record<string, string> = {
        Russia: "RU", Russian: "RU",
        Ukraine: "UA", Ukrainian: "UA",
        France: "FR", French: "FR",
        Germany: "DE", German: "DE",
        Denmark: "DK", Danish: "DK",
        Sweden: "SE", Swedish: "SE",
        Poland: "PL", Polish: "PL",
        Brazil: "BR", Brazilian: "BR",
        "United States": "US", American: "US", USA: "US",
        Canada: "CA", Canadian: "CA",
        "United Kingdom": "GB", British: "GB", UK: "GB",
        Finland: "FI", Finnish: "FI",
        Norway: "NO", Norwegian: "NO",
        Latvia: "LV", Latvian: "LV",
        Estonia: "EE", Estonian: "EE",
        Lithuania: "LT", Lithuanian: "LT",
        Bosnia: "BA", Bosnian: "BA",
        Serbia: "RS", Serbian: "RS",
        Turkey: "TR", Turkish: "TR",
        Mongolia: "MN", Mongolian: "MN",
        Portugal: "PT", Portuguese: "PT",
        Israel: "IL", Israeli: "IL",
        Hungary: "HU", Hungarian: "HU",
        Slovakia: "SK", Slovak: "SK",
        Kazakhstan: "KZ", Kazakh: "KZ",
        Bulgaria: "BG", Bulgarian: "BG",
        Australia: "AU", Australian: "AU",
        China: "CN", Chinese: "CN",
        Korea: "KR", Korean: "KR",
        Japan: "JP", Japanese: "JP",
        Argentina: "AR", Argentine: "AR",
        International: "EU", Europe: "EU",
    };

    return countryMap[country] || country.slice(0, 2).toUpperCase();
}

// Check if API key is configured
export function isApiKeyConfigured(): boolean {
    return !!process.env.PANDASCORE_API_KEY;
}
