"use client";

import { useState } from "react";
import { UserPlus, Check, Loader2 } from "lucide-react";

export default function AddFriendButton({ userId, className = "", minimal = false }: { userId: string, className?: string, minimal?: boolean }) {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleAddFriend = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (res.ok) {
                setSent(true);
            } else {
                // simple alert for now
                const data = await res.json();
                alert(data.error || "Failed to send request");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        if (minimal) {
            return <div className="text-green-500"><Check className="w-4 h-4" /></div>;
        }
        return (
            <button disabled className={`px-4 py-2 bg-green-500/10 text-green-500 rounded-lg flex items-center gap-2 font-bold cursor-default border border-green-500/20 ${className}`}>
                <Check className="w-4 h-4" />
                Requests Sent
            </button>
        );
    }

    if (minimal) {
        return (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddFriend();
                }}
                disabled={loading}
                className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors"
                title="Add Friend"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            </button>
        );
    }

    return (
        <button
            onClick={handleAddFriend}
            disabled={loading}
            className={`px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg flex items-center gap-2 font-medium transition-colors ${className}`}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Add Friend
        </button>
    );
}
