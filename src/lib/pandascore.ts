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

// MOCK DATA for development without API Key
const MOCK_TEAMS: PandaScoreTeam[] = [
    {
        id: 3216,
        slug: "natus-vincere",
        name: "Natus Vincere",
        acronym: "NaVi",
        image_url: "https://cdn.pandascore.co/images/team/image/3216/1022px_natus_vincere_2021_lightmode.png",
        location: "UA",
        players: [
            { id: 17688, slug: "aleksib", name: "Aleksib", first_name: "Aleksi", last_name: "Virolainen", nationality: "FI", image_url: "https://cdn.pandascore.co/images/player/image/17688/600px_aleksib_dhm_dallas_2019.png", role: "In-game Leader" },
            { id: 24656, slug: "b1t", name: "b1t", first_name: "Valerij", last_name: "Vakhovskij", nationality: "UA", image_url: "https://cdn.pandascore.co/images/player/image/24656/lw_ktqy_zn.png", role: "Rifler" },
            { id: 25384, slug: "im", name: "iM", first_name: "Mihai", last_name: "Ivan", nationality: "RO", image_url: "https://cdn.pandascore.co/images/player/image/25384/im_nexus.png", role: "Rifler" },
            { id: 26564, slug: "jl", name: "jL", first_name: "Justinas", last_name: "Lekavicius", nationality: "LT", image_url: "https://cdn.pandascore.co/images/player/image/26564/eb_mn_zt_t_wk_a_etq9u.png", role: "Rifler" },
            { id: 29289, slug: "wonderful", name: "w0nderful", first_name: "Ihor", last_name: "Zhdanov", nationality: "UA", image_url: "https://cdn.pandascore.co/images/player/image/29289/900px_w0nderful_star_ladder_major_berlin_2019.png", role: "Sniper" }
        ]
    },
    {
        id: 3455,
        slug: "team-vitality",
        name: "Team Vitality",
        acronym: "VIT",
        image_url: "https://cdn.pandascore.co/images/team/image/3455/team_vitalitylogo_square.png",
        location: "FR",
        players: [
             { id: 17515, slug: "apex", name: "apEX", first_name: "Dan", last_name: "Madesclaire", nationality: "FR", image_url: "https://cdn.pandascore.co/images/player/image/17515/600px_ap_ex___epicenter_2019.png", role: "In-game Leader" },
             { id: 18452, slug: "zywoo", name: "ZywOo", first_name: "Mathieu", last_name: "Herbaut", nationality: "FR", image_url: "https://cdn.pandascore.co/images/player/image/18452/900px_zyw_oo_esl_one_cologne_2019.png", role: "Sniper" },
             { id: 29789, slug: "spinx", name: "Spinx", first_name: "Lotan", last_name: "Giladi", nationality: "IL", image_url: "https://cdn.pandascore.co/images/player/image/29789/600px_spinx___iem_fall_2021.png", role: "Rifler" },
             { id: 24714, slug: "mezii", name: "mezii", first_name: "William", last_name: "Merriman", nationality: "GB", image_url: "https://cdn.pandascore.co/images/player/image/24714/original.png", role: "Rifler" },
             { id: 24881, slug: "flamez", name: "flameZ", first_name: "Shahar", last_name: "Shushan", nationality: "IL", image_url: "https://cdn.pandascore.co/images/player/image/24881/800px_flame_z.png", role: "Rifler" }
        ]
    },
     {
        id: 3210,
        slug: "g2-esports",
        name: "G2 Esports",
        acronym: "G2",
        image_url: "https://cdn.pandascore.co/images/team/image/3210/5995.png",
        location: "DE",
        players: [
            { id: 17958, slug: "hunter", name: "huNter-", first_name: "Nemanja", last_name: "Kovač", nationality: "BA", image_url: "https://cdn.pandascore.co/images/player/image/17958/900px_hu_nter__epl_s10_finals_odense_2019.png", role: "Rifler" },
            { id: 17666, slug: "niko", name: "NiKo", first_name: "Nikola", last_name: "Kovač", nationality: "BA", image_url: "https://cdn.pandascore.co/images/player/image/17666/600px_ni_ko___iem_cologne_2021.png", role: "Rifler" },
            { id: 23992, slug: "m0nesy", name: "m0NESY", first_name: "Ilya", last_name: "Osipov", nationality: "RU", image_url: "https://cdn.pandascore.co/images/player/image/23992/600px_m0_nesy___iem_katowice_2022.png", role: "Sniper" },
            { id: 21433, slug: "malbsmd", name: "malbsMd", first_name: "Mario", last_name: "Samayoa", nationality: "GT", image_url: "https://cdn.pandascore.co/images/player/image/21433/900px_malbs_md_epl10.png", role: "Rifler" },
            { id: 17402, slug: "snax", name: "Snax", first_name: "Janusz", last_name: "Pogorzelski", nationality: "PL", image_url: "https://cdn.pandascore.co/images/player/image/17402/600px_snax_starladder_major_berlin_2019.png", role: "In-game Leader" }
        ]
    },
    {
        id: 3212,
        slug: "faze-clan",
        name: "FaZe Clan",
        acronym: "FaZe",
        image_url: "https://cdn.pandascore.co/images/team/image/3212/285px_fa_ze_esports_october_2025_lightmode.png",
        location: "US",
        players: [
            { id: 17524, slug: "karrigan", name: "karrigan", first_name: "Finn", last_name: "Andersen", nationality: "DK", image_url: "https://cdn.pandascore.co/images/player/image/17524/600px_karrigan___iem_cologne_2021.png", role: "In-game Leader" },
            { id: 17531, slug: "twistzz", name: "Twistzz", first_name: "Russel", last_name: "Van Dulken", nationality: "CA", image_url: "https://cdn.pandascore.co/images/player/image/17531/600px_twistzz___iem_cologne_2021.png", role: "Rifler" },
            { id: 17663, slug: "ropz", name: "ropz", first_name: "Robin", last_name: "Kool", nationality: "EE", image_url: "https://cdn.pandascore.co/images/player/image/17663/600px_ropz___iem_cologne_2021.png", role: "Rifler" },
            { id: 20372, slug: "broky", name: "broky", first_name: "Helvijs", last_name: "Saukants", nationality: "LV", image_url: "https://cdn.pandascore.co/images/player/image/20372/600px_broky___iem_cologne_2021.png", role: "Sniper" },
            { id: 20397, slug: "frozen", name: "frozen", first_name: "David", last_name: "Čerňanský", nationality: "SK", image_url: "https://cdn.pandascore.co/images/player/image/20397/600px_frozen___iem_cologne_2021.png", role: "Rifler" }
        ]
    },
    {
        id: 3240,
        slug: "mousesports",
        name: "MOUZ",
        acronym: "MOUZ",
        image_url: "https://cdn.pandascore.co/images/team/image/3240/208px_mouz_2021_allmode.png",
        location: "DE",
        players: [
             { id: 17853, slug: "brollan", name: "Brollan", first_name: "Ludvig", last_name: "Brolin", nationality: "SE", image_url: "https://cdn.pandascore.co/images/player/image/17853/900px_brollan___iem_katowice_2020.png", role: "Rifler" },
             { id: 26391, slug: "torzsi", name: "torzsi", first_name: "Ádám", last_name: "Torzsás", nationality: "HU", image_url: "https://cdn.pandascore.co/images/player/image/26391/800px_torzsi.png", role: "Sniper" },
             { id: 26600, slug: "jimpphat", name: "Jimpphat", first_name: "Jimi", last_name: "Salo", nationality: "FI", image_url: "https://cdn.pandascore.co/images/player/image/26600/jimpphat.png", role: "Rifler" },
             { id: 29856, slug: "xertion", name: "xertioN", first_name: "Dorian", last_name: "Berman", nationality: "IL", image_url: "https://cdn.pandascore.co/images/player/image/29856/mouz_nxt_xertio_n.png", role: "Rifler" },
             { id: 23626, slug: "siuhy", name: "siuhy", first_name: "Kamil", last_name: "Szkaradek", nationality: "PL", image_url: "https://cdn.pandascore.co/images/player/image/23626/siuhy.png", role: "In-game Leader" }
        ]
    },
    {
        id: 119369,
        slug: "team-spirit",
        name: "Team Spirit",
        acronym: "TS",
        image_url: "https://cdn.pandascore.co/images/team/image/119369/600px_team_spirit_2021.png",
        location: "RU",
        players: [
            { id: 18222, slug: "chopper", name: "chopper", first_name: "Leonid", last_name: "Vishnyakov", nationality: "RU", image_url: "https://cdn.pandascore.co/images/player/image/18222/600px_chopper___iem_katowice_2021.png", role: "In-game Leader" },
            { id: 20436, slug: "magixx", name: "magixx", first_name: "Boris", last_name: "Vorobiev", nationality: "RU", image_url: "https://cdn.pandascore.co/images/player/image/20436/600px_magixx___iem_katowice_2021.png", role: "Rifler" },
            { id: 21115, slug: "shiro", name: "sh1ro", first_name: "Dmitry", last_name: "Sokolov", nationality: "RU", image_url: "https://cdn.pandascore.co/images/player/image/21115/600px_sh1ro___iem_katowice_2021.png", role: "Sniper" },
            { id: 37780, slug: "zont1x", name: "zont1x", first_name: "Myroslav", last_name: "Plakhotia", nationality: "UA", image_url: "https://cdn.pandascore.co/images/player/image/37780/zont1x.png", role: "Rifler" },
            { id: 41819, slug: "donk", name: "donk", first_name: "Danil", last_name: "Kryshkovets", nationality: "RU", image_url: "https://cdn.pandascore.co/images/player/image/41819/donk_spirit.png", role: "Rifler" }
        ]
    }
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
function getApiKey(): string | null {
    return process.env.PANDASCORE_API_KEY || null;
}

// Get top CS2 teams with real data from PandaScore
export async function getTopCS2Teams(): Promise<PandaScoreTeam[]> {
    const cacheKey = "cs2-top-teams-v3";
    const cached = getFromCache<PandaScoreTeam[]>(cacheKey);
    if (cached) return cached;

    const apiKey = getApiKey();

    if (!apiKey) {
        console.warn("PANDASCORE_API_KEY not set. Using mock data.");
        return MOCK_TEAMS;
    }

    try {
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
    } catch (error) {
        console.error("Failed to fetch from PandaScore, falling back to mock:", error);
        return MOCK_TEAMS;
    }
}

export async function getCS2TeamById(teamId: number): Promise<PandaScoreTeam | null> {
    const cacheKey = `cs2-team-${teamId}`;
    const cached = getFromCache<PandaScoreTeam>(cacheKey);
    if (cached) return cached;

    const apiKey = getApiKey();
    
    if (!apiKey) {
         const mockTeam = MOCK_TEAMS.find(t => t.id === teamId);
         return mockTeam || null;
    }

    try {
        const team = await pandaFetch<PandaScoreTeam>(`/csgo/teams/${teamId}`, apiKey);
        setInCache(cacheKey, team);
        return team;
    } catch (error) {
        console.error(`Failed to fetch team ${teamId}, fallback to mock search`, error);
        const mockTeam = MOCK_TEAMS.find(t => t.id === teamId);
        return mockTeam || null;
    }
}

export async function searchCS2Teams(query: string): Promise<PandaScoreTeam[]> {
    const cacheKey = `cs2-search-${query}`;
    const cached = getFromCache<PandaScoreTeam[]>(cacheKey);
    if (cached) return cached;

    const apiKey = getApiKey();
    
    if (!apiKey) {
         const lowerQuery = query.toLowerCase();
         return MOCK_TEAMS.filter(t => t.name.toLowerCase().includes(lowerQuery));
    }

    try {
        const teams = await pandaFetch<PandaScoreTeam[]>("/csgo/teams", apiKey, {
            "search[name]": query,
            "page[size]": "20",
        });

        setInCache(cacheKey, teams);
        return teams;
    } catch (error) {
         console.error("Search failed, using mock", error);
         return MOCK_TEAMS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
    }
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
