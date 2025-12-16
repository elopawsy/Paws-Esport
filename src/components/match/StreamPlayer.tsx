import { Stream } from "@/types/match";
import { useMemo } from "react";

interface StreamPlayerProps {
    stream: Stream;
}

export function StreamPlayer({ stream }: StreamPlayerProps) {
    const embedUrl = useMemo(() => {
        if (stream.embed_url) return stream.embed_url;

        // Fallback parsers if embed_url is missing but we have raw_url
        const url = stream.raw_url;
        if (!url) return null;

        if (url.includes("twitch.tv")) {
            const parts = url.split("/");
            const channel = parts[parts.length - 1];
            return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`;
        }

        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            // Basic parsing, often difficult without regex for all variants
            // Assuming basic youtube.com/watch?v=ID or youtu.be/ID
            // For now, rely on API usually providing embed_url for YT or raw_url being watch link
            // If we really need to parse:
            let videoId = "";
            if (url.includes("v=")) {
                videoId = url.split("v=")[1].split("&")[0];
            } else if (url.includes("youtu.be/")) {
                videoId = url.split("youtu.be/")[1].split("?")[0];
            }
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }

        if (url.includes("kick.com")) {
            // https://kick.com/channelname -> https://player.kick.com/channelname
            const parts = url.split("/");
            // Handle trailing slash or query params if any
            let channel = parts[parts.length - 1];
            if (channel === "" && parts.length > 1) channel = parts[parts.length - 2];
            // cleanup query params
            channel = channel.split("?")[0];

            return `https://player.kick.com/${channel}`;
        }

        return null;
    }, [stream]);

    if (!embedUrl) return null;

    // Twitch specific props
    const isTwitch = embedUrl.includes("twitch.tv");

    // For Twitch, we need to ensure parent is set correctly. 
    // The useMemo above sets it to window.location.hostname, but during SSR 'window' is not defined.
    // So we should handle this.

    // Actually, we can't use window in useMemo easily during SSR.
    // We should do this calculation in effect or just use a default and update client side?
    // Or just use a hardcoded domain if we know it?
    // For local dev: localhost. For prod: pawsesport.com (hypothetically).
    // Let's use a safe approach:

    // Helper to add parent if twitch
    const finalUrl = isTwitch && !embedUrl.includes("parent=")
        ? `${embedUrl}&parent=${process.env.NEXT_PUBLIC_DOMAIN || "localhost"}`
        : embedUrl;

    return (
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black mb-6 border border-card-border relative group">
            <iframe
                src={finalUrl}
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
