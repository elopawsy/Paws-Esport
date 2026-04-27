"use client";

import { Stream } from "@/types/match";
import { useMemo, useState, useEffect } from "react";

interface StreamPlayerProps {
    stream: Stream;
}

export function StreamPlayer({ stream }: StreamPlayerProps) {
    const [hostname, setHostname] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setHostname(window.location.hostname);
        }
    }, []);

    const embedUrl = useMemo(() => {
        let url = stream.embed_url;

        // Fallback logic if valid embed_url is missing
        if (!url && stream.raw_url) {
            const raw = stream.raw_url;
            if (raw.includes("twitch.tv")) {
                const parts = raw.split("/");
                const channel = parts[parts.length - 1];
                // Base structure, parent added later
                url = `https://player.twitch.tv/?channel=${channel}`;
            } else if (raw.includes("youtube.com") || raw.includes("youtu.be")) {
                let videoId = "";
                if (raw.includes("v=")) {
                    videoId = raw.split("v=")[1].split("&")[0];
                } else if (raw.includes("youtu.be/")) {
                    videoId = raw.split("youtu.be/")[1].split("?")[0];
                }
                if (videoId) url = `https://www.youtube.com/embed/${videoId}`;
            } else if (raw.includes("kick.com")) {
                const parts = raw.split("/");
                let channel = parts[parts.length - 1];
                if (channel === "" && parts.length > 1) channel = parts[parts.length - 2];
                channel = channel.split("?")[0];
                url = `https://player.kick.com/${channel}`;
            }
        }

        if (!url) return null;

        // For Twitch, we MUST append the parent parameter matching the current domain
        if (url.includes("twitch.tv") || url.includes("player.twitch.tv")) {
            // Check if parent is missing
            if (!url.includes("parent=")) {
                // If we have hostname (client-side), use it. 
                // We typically need to support 'localhost' in dev mode explicitly if hostname is localhost.
                // We can append multiple parents if needed, but usually one matching current domain is enough.
                if (hostname) {
                    const separator = url.includes("?") ? "&" : "?";
                    return `${url}${separator}parent=${hostname}`;
                }
                // During SSR or initial render before effect, return null or a placeholder?
                // Or return URL without parent (will likely fail to load inside iframe but safer than crashing)
                // Returning unmodified URL might show error until hydration fixes it
                return url;
            }
        }

        return url;
    }, [stream, hostname]);

    if (!embedUrl) return null;

    return (
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black mb-6 border border-card-border relative group">
            <iframe
                src={embedUrl}
                title="Live Stream"
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse shadow-lg pointer-events-none">
                LIVE
            </div>
        </div>
    );
}
