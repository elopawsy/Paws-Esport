"use client";

import { memo } from "react";

import Image from "next/image";

export const CS2_COUNTRIES = [
    { code: "ALL", name: "All Countries" },
    { code: "FR", name: "France" },
    { code: "DK", name: "Denmark" },
    { code: "SE", name: "Sweden" },
    { code: "RU", name: "Russia" },
    { code: "UA", name: "Ukraine" },
    { code: "PL", name: "Poland" },
    { code: "DE", name: "Germany" },
    { code: "BR", name: "Brazil" },
    { code: "US", name: "USA" },
    { code: "GB", name: "United Kingdom" },
    { code: "FI", name: "Finland" },
    { code: "NO", name: "Norway" },
    { code: "EE", name: "Estonia" },
    { code: "LV", name: "Latvia" },
    { code: "LT", name: "Lithuania" },
    { code: "BA", name: "Bosnia" },
    { code: "RS", name: "Serbia" },
    { code: "TR", name: "Turkey" },
    { code: "IL", name: "Israel" },
    { code: "KZ", name: "Kazakhstan" },
    { code: "AU", name: "Australia" },
    { code: "CN", name: "China" },
    { code: "AR", name: "Argentina" },
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
    if (!code) return null;

    const normalizedCode = code.toLowerCase();

    // Size mapping
    const dimensions = {
        sm: { w: 16, h: 12 },
        md: { w: 20, h: 15 },
        lg: { w: 28, h: 21 },
    };

    const { w, h } = dimensions[size];

    return (
        <span className="inline-flex items-center gap-1.5" title={code.toUpperCase()}>
            <span className={`relative inline-block overflow-hidden rounded-sm shadow-sm bg-black/20`} style={{ width: w, height: h }}>
                <Image
                    src={`https://flagcdn.com/w40/${normalizedCode}.png`}
                    alt={code}
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized // FlagCDN is external
                />
            </span>
            {showCode && <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">{code.toUpperCase()}</span>}
        </span>
    );
});

export default CountryFlag;
