"use client";

import {
    Crown,
    Crosshair,
    Target,
    Shield,
    Ghost,
    Mountain,
    Trees,
    Zap,
    Heart,
    Sword,
    Cloud,
    Eye,
    Users,
    Star,
} from "lucide-react";
import type { VideoGameSlug } from "@/types";

/**
 * Role configuration for each game
 */
const CS_ROLES: Record<string, { icon: typeof Crown; color: string; label: string }> = {
    "in-game leader": { icon: Crown, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", label: "IGL" },
    "igl": { icon: Crown, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", label: "IGL" },
    "rifler": { icon: Crosshair, color: "text-blue-500 bg-blue-500/10 border-blue-500/30", label: "Rifler" },
    "sniper": { icon: Target, color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "AWP" },
    "awper": { icon: Target, color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "AWP" },
    "support": { icon: Shield, color: "text-green-500 bg-green-500/10 border-green-500/30", label: "Support" },
    "lurker": { icon: Ghost, color: "text-gray-400 bg-gray-400/10 border-gray-400/30", label: "Lurker" },
    "entry fragger": { icon: Sword, color: "text-red-500 bg-red-500/10 border-red-500/30", label: "Entry" },
};

const LOL_ROLES: Record<string, { icon: typeof Crown; color: string; label: string }> = {
    "top": { icon: Mountain, color: "text-amber-600 bg-amber-600/10 border-amber-600/30", label: "Top" },
    "jungle": { icon: Trees, color: "text-green-500 bg-green-500/10 border-green-500/30", label: "Jungle" },
    "jun": { icon: Trees, color: "text-green-500 bg-green-500/10 border-green-500/30", label: "Jungle" },
    "mid": { icon: Zap, color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "Mid" },
    "adc": { icon: Crosshair, color: "text-red-500 bg-red-500/10 border-red-500/30", label: "ADC" },
    "bot": { icon: Crosshair, color: "text-red-500 bg-red-500/10 border-red-500/30", label: "ADC" },
    "sup": { icon: Heart, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30", label: "Support" },
    "support": { icon: Heart, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30", label: "Support" },
};

const DOTA_ROLES: Record<string, { icon: typeof Crown; color: string; label: string }> = {
    "carry": { icon: Sword, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", label: "Carry" },
    "1": { icon: Sword, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", label: "Pos 1" },
    "mid": { icon: Zap, color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "Mid" },
    "2": { icon: Zap, color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "Pos 2" },
    "offlane": { icon: Shield, color: "text-amber-600 bg-amber-600/10 border-amber-600/30", label: "Offlane" },
    "3": { icon: Shield, color: "text-amber-600 bg-amber-600/10 border-amber-600/30", label: "Pos 3" },
    "soft support": { icon: Heart, color: "text-green-500 bg-green-500/10 border-green-500/30", label: "Pos 4" },
    "4": { icon: Heart, color: "text-green-500 bg-green-500/10 border-green-500/30", label: "Pos 4" },
    "hard support": { icon: Star, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30", label: "Pos 5" },
    "5": { icon: Star, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30", label: "Pos 5" },
};

const VALORANT_ROLES: Record<string, { icon: typeof Crown; color: string; label: string }> = {
    "duelist": { icon: Sword, color: "text-red-500 bg-red-500/10 border-red-500/30", label: "Duelist" },
    "controller": { icon: Cloud, color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "Controller" },
    "initiator": { icon: Eye, color: "text-green-500 bg-green-500/10 border-green-500/30", label: "Initiator" },
    "sentinel": { icon: Shield, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30", label: "Sentinel" },
    "igl": { icon: Crown, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", label: "IGL" },
};

const R6_ROLES: Record<string, { icon: typeof Crown; color: string; label: string }> = {
    "attacker": { icon: Sword, color: "text-orange-500 bg-orange-500/10 border-orange-500/30", label: "Attacker" },
    "defender": { icon: Shield, color: "text-blue-500 bg-blue-500/10 border-blue-500/30", label: "Defender" },
    "flex": { icon: Users, color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "Flex" },
    "support": { icon: Heart, color: "text-green-500 bg-green-500/10 border-green-500/30", label: "Support" },
    "entry": { icon: Crosshair, color: "text-red-500 bg-red-500/10 border-red-500/30", label: "Entry" },
    "igl": { icon: Crown, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", label: "IGL" },
};

const DEFAULT_ROLE = { icon: Users, color: "text-muted-foreground bg-secondary border-card-border", label: "" };

function getRoleConfig(role: string, game?: VideoGameSlug) {
    const normalizedRole = role.toLowerCase().trim();

    switch (game) {
        case "lol":
            return LOL_ROLES[normalizedRole] || DEFAULT_ROLE;
        case "valorant":
            return VALORANT_ROLES[normalizedRole] || DEFAULT_ROLE;
        case "cs-2":
        default:
            // CS2 is default since it's the main game of the app
            return CS_ROLES[normalizedRole] || DEFAULT_ROLE;
    }
}

interface RoleBadgeProps {
    role: string;
    game?: VideoGameSlug;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
}

export function RoleBadge({ role, game, showLabel = true, size = "sm" }: RoleBadgeProps) {
    const config = getRoleConfig(role, game);
    const Icon = config.icon;
    const displayLabel = config.label || role;

    const sizeClasses = {
        sm: "text-[10px] px-1.5 py-0.5 gap-1",
        md: "text-xs px-2 py-1 gap-1.5",
        lg: "text-sm px-3 py-1.5 gap-2",
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-3.5 h-3.5",
        lg: "w-4 h-4",
    };

    return (
        <span
            className={`inline-flex items-center font-bold uppercase tracking-wider border rounded ${config.color} ${sizeClasses[size]}`}
            title={role}
        >
            <Icon className={iconSizes[size]} />
            {showLabel && <span>{displayLabel}</span>}
        </span>
    );
}

export default RoleBadge;
