"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2, Check } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface FollowTeamButtonProps {
    teamId: number;
    teamName: string;
    teamAcronym?: string | null;
    teamImageUrl?: string | null;
}

export default function FollowTeamButton({ teamId, teamName, teamAcronym, teamImageUrl }: FollowTeamButtonProps) {
    const { data: session } = useSession();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isToggling, setIsToggling] = useState(false);

    // Check if user is following this team
    useEffect(() => {
        if (!session?.user) {
            setIsLoading(false);
            return;
        }

        async function checkFollowStatus() {
            try {
                const res = await fetch("/api/user/tracked-teams");
                if (res.ok) {
                    const teams = await res.json();
                    setIsFollowing(teams.some((t: any) => t.teamId === teamId));
                }
            } catch (error) {
                console.error("Error checking follow status:", error);
            } finally {
                setIsLoading(false);
            }
        }
        checkFollowStatus();
    }, [session?.user, teamId]);

    const handleToggleFollow = async () => {
        if (!session?.user) return;

        setIsToggling(true);
        try {
            if (isFollowing) {
                // Unfollow
                const res = await fetch(`/api/user/tracked-teams?teamId=${teamId}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    setIsFollowing(false);
                }
            } else {
                // Follow
                const res = await fetch("/api/user/tracked-teams", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        teamId,
                        teamName,
                        teamAcronym,
                        teamImageUrl,
                    }),
                });
                if (res.ok) {
                    setIsFollowing(true);
                }
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
        } finally {
            setIsToggling(false);
        }
    };

    // Don't show if not logged in
    if (!session?.user) {
        return null;
    }

    if (isLoading) {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-secondary border border-card-border rounded-lg text-sm font-medium"
            >
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
            </button>
        );
    }

    return (
        <button
            onClick={handleToggleFollow}
            disabled={isToggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isFollowing
                    ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                    : "bg-primary hover:bg-primary-hover text-primary-foreground"
                }`}
        >
            {isToggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
                <Check className="w-4 h-4" />
            ) : (
                <Heart className="w-4 h-4" />
            )}
            {isFollowing ? "Following" : "Follow"}
        </button>
    );
}
