"use client";

import { memo } from "react";

// Country code to emoji flag mapping
const COUNTRY_FLAGS: Record<string, string> = {
    // Europe
    FR: "🇫🇷", DE: "🇩🇪", DK: "🇩🇰", SE: "🇸🇪", PL: "🇵🇱", FI: "🇫🇮",
    NO: "🇳🇴", NL: "🇳🇱", BE: "🇧🇪", ES: "🇪🇸", IT: "🇮🇹", PT: "🇵🇹",
    GB: "🇬🇧", UK: "🇬🇧", IE: "🇮🇪", AT: "🇦🇹", CH: "🇨🇭", CZ: "🇨🇿",
    SK: "🇸🇰", HU: "🇭🇺", RO: "🇷🇴", BG: "🇧🇬", GR: "🇬🇷", HR: "🇭🇷",
    RS: "🇷🇸", BA: "🇧🇦", SI: "🇸🇮", MK: "🇲🇰", ME: "🇲🇪", AL: "🇦🇱",
    XK: "🇽🇰", LV: "🇱🇻", LT: "🇱🇹", EE: "🇪🇪",
    // CIS
    RU: "🇷🇺", UA: "🇺🇦", BY: "🇧🇾", KZ: "🇰🇿", UZ: "🇺🇿",
    // Americas
    US: "🇺🇸", CA: "🇨🇦", BR: "🇧🇷", AR: "🇦🇷", CL: "🇨🇱", MX: "🇲🇽",
    CO: "🇨🇴", PE: "🇵🇪", VE: "🇻🇪", UY: "🇺🇾", GT: "🇬🇹",
    // Asia
    CN: "🇨🇳", JP: "🇯🇵", KR: "🇰🇷", TW: "🇹🇼", VN: "🇻🇳", TH: "🇹🇭",
    MY: "🇲🇾", SG: "🇸🇬", ID: "🇮🇩", PH: "🇵🇭", IN: "🇮🇳", PK: "🇵🇰",
    // Middle East
    TR: "🇹🇷", IL: "🇮🇱", SA: "🇸🇦", AE: "🇦🇪", JO: "🇯🇴", LB: "🇱🇧",
    // Oceania
    AU: "🇦🇺", NZ: "🇳🇿",
    // Africa
    ZA: "🇿🇦", MA: "🇲🇦", EG: "🇪🇬",
    // Other
    MN: "🇲🇳", EU: "🇪🇺",
};

// Popular CS2 countries for filtering
export const CS2_COUNTRIES = [
    { code: "ALL", name: "All Countries", flag: "🌍" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "DK", name: "Denmark", flag: "🇩🇰" },
    { code: "SE", name: "Sweden", flag: "🇸🇪" },
    { code: "RU", name: "Russia", flag: "🇷🇺" },
    { code: "UA", name: "Ukraine", flag: "🇺🇦" },
    { code: "PL", name: "Poland", flag: "🇵🇱" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "BR", name: "Brazil", flag: "🇧🇷" },
    { code: "US", name: "USA", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "FI", name: "Finland", flag: "🇫🇮" },
    { code: "NO", name: "Norway", flag: "🇳🇴" },
    { code: "EE", name: "Estonia", flag: "🇪🇪" },
    { code: "LV", name: "Latvia", flag: "🇱🇻" },
    { code: "LT", name: "Lithuania", flag: "🇱🇹" },
    { code: "BA", name: "Bosnia", flag: "🇧🇦" },
    { code: "RS", name: "Serbia", flag: "🇷🇸" },
    { code: "TR", name: "Turkey", flag: "🇹🇷" },
    { code: "IL", name: "Israel", flag: "🇮🇱" },
    { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "CN", name: "China", flag: "🇨🇳" },
    { code: "AR", name: "Argentina", flag: "🇦🇷" },
];

interface CountryFlagProps {
    code: string | null;
    size?: "sm" | "md" | "lg";
    showCode?: boolean;
}

const CountryFlag = memo(function CountryFlag({
    code,
    size = "md",
    showCode = false
}: CountryFlagProps) {
    const normalizedCode = code?.toUpperCase() || "EU";
    const flag = COUNTRY_FLAGS[normalizedCode] || "🏳️";

    const sizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-lg",
    };

    return (
        <span className={`inline-flex items-center gap-1 ${sizeClasses[size]}`} title={normalizedCode}>
            <span>{flag}</span>
            {showCode && <span className="text-muted text-[10px] uppercase">{normalizedCode}</span>}
        </span>
    );
});

export default CountryFlag;
export { COUNTRY_FLAGS };
