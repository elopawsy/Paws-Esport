"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { VIDEO_GAMES } from "@/types";
import type { VideoGameSlug } from "@/types";

interface GameSelectorProps {
  currentGame: VideoGameSlug;
}

/**
 * Client-side game selector that updates URL params
 * This allows the Server Component to receive the selection via searchParams
 */
export default function GameSelector({ currentGame }: GameSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGameChange = (game: VideoGameSlug) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("game", game);
    router.push(`/?${params.toString()}`);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
        <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest whitespace-nowrap">
          select game
        </span>
        <div className="h-8 w-px bg-card-border flex-shrink-0" />
        <div className="flex gap-3">
          {Object.entries(VIDEO_GAMES).map(([slug, game]) => (
            <button
              key={slug}
              onClick={() => handleGameChange(slug as VideoGameSlug)}
              className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold uppercase tracking-wide rounded-lg transition-all whitespace-nowrap ${
                currentGame === slug
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary/50 border border-card-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              <img
                src={game.logo}
                alt={game.name}
                width={20}
                height={20}
                className="object-contain w-5 h-5"
                style={{ filter: "var(--logo-filter)" }}
              />
              {game.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
