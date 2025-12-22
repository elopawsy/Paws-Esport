"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Loader2, UserPlus, Trophy, XCircle, Info } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Notification {
    id: string;
    type: "FRIEND_REQUEST" | "FRIEND_ACCEPTED" | "BET_WON" | "BET_LOST" | "SYSTEM";
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: string;
}

export default function NotificationCenter() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!session?.user) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch on mount and when session changes
    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [session?.user]);

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    // Mark single notification as read
    const markAsRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationIds: [id] }),
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const getNotificationIcon = (type: Notification["type"]) => {
        switch (type) {
            case "FRIEND_REQUEST":
            case "FRIEND_ACCEPTED":
                return UserPlus;
            case "BET_WON":
                return Trophy;
            case "BET_LOST":
                return XCircle;
            default:
                return Info;
        }
    };

    const getNotificationColor = (type: Notification["type"]) => {
        switch (type) {
            case "FRIEND_REQUEST":
            case "FRIEND_ACCEPTED":
                return "text-blue-500";
            case "BET_WON":
                return "text-green-500";
            case "BET_LOST":
                return "text-red-500";
            default:
                return "text-primary";
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US");
    };

    if (!session?.user) return null;

    return (
        <div ref={menuRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                className="relative p-2 rounded-md hover:bg-secondary transition-colors"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-card-border rounded-lg shadow-xl overflow-hidden z-50" role="menu" aria-label="Notifications menu">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
                        <h3 className="font-bold" id="notifications-heading">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
                            >
                                <CheckCheck className="w-3 h-3" />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-muted-foreground">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const Icon = getNotificationIcon(notif.type);
                                const colorClass = getNotificationColor(notif.type);

                                const content = (
                                    <div
                                        className={`flex gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer ${!notif.read ? "bg-primary/5" : ""
                                            }`}
                                        onClick={() => !notif.read && markAsRead(notif.id)}
                                    >
                                        <div className={`flex-shrink-0 p-2 rounded-full bg-secondary ${colorClass}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatTime(notif.createdAt)}
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <div className="flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                        )}
                                    </div>
                                );

                                if (notif.link) {
                                    return (
                                        <Link key={notif.id} href={notif.link} onClick={() => setIsOpen(false)}>
                                            {content}
                                        </Link>
                                    );
                                }
                                return <div key={notif.id}>{content}</div>;
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
