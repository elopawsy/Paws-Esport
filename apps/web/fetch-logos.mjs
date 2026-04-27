// Script to fetch team logos from PandaScore
import { readFileSync } from "fs";

// Read .env.local manually
const envContent = readFileSync(".env.local", "utf-8");
const API_KEY = envContent.match(/PANDASCORE_API_KEY=(.+)/)?.[1]?.trim();

const BASE_URL = "https://api.pandascore.co/csgo";

// Team name mappings (HLTV name -> PandaScore search term)
const TEAM_MAPPINGS = {
    FURIA: "furia",
    Vitality: "vitality",
    Falcons: "falcons",
    MOUZ: "mouz",
    "The MongolZ": "mongolz",
    Spirit: "spirit",
    "Natus Vincere": "natus vincere",
    G2: "g2",
    Aurora: "eternal fire",
    paiN: "pain gaming",
    Astralis: "astralis",
    FaZe: "faze",
    "3DMAX": "3dmax",
    Legacy: "legacy",
    Liquid: "liquid",
    B8: "b8",
    GamerLegion: "gamerlegion",
    HEROIC: "heroic",
    "Virtus.pro": "virtus.pro",
    SAW: "saw",
};

async function fetchTeamLogo(searchName) {
    try {
        const url = `${BASE_URL}/teams?search[name]=${encodeURIComponent(searchName)}&per_page=5`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${API_KEY}` },
        });

        if (!res.ok) {
            console.log(`❌ ${searchName}: HTTP ${res.status}`);
            return null;
        }

        const teams = await res.json();
        if (teams.length > 0) {
            const team = teams[0];
            console.log(`✅ ${searchName}: ${team.image_url || "NO LOGO"}`);
            return team.image_url;
        } else {
            console.log(`❌ ${searchName}: Not found`);
            return null;
        }
    } catch (e) {
        console.log(`❌ ${searchName}: Error - ${e.message}`);
        return null;
    }
}

async function main() {
    console.log("Fetching logos from PandaScore...\n");
    console.log("API Key:", API_KEY ? `✅ Found (${API_KEY.slice(0, 8)}...)` : "❌ Missing");
    console.log("");

    if (!API_KEY) {
        console.log("Please add PANDASCORE_API_KEY to .env.local");
        return;
    }

    const results = {};

    for (const [hltvName, searchName] of Object.entries(TEAM_MAPPINGS)) {
        const logo = await fetchTeamLogo(searchName);
        results[hltvName] = logo || "/team-placeholder.svg";
        // Rate limiting
        await new Promise((r) => setTimeout(r, 200));
    }

    console.log("\n--- Results (copy these URLs) ---");
    console.log(JSON.stringify(results, null, 2));
}

main();
