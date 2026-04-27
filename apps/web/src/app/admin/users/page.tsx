"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Ban, ChevronDown } from "lucide-react";

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    banned: boolean;
    banReason: string | null;
    coins: number;
    createdAt: string;
}

const ROLES = [
    { value: "user", label: "User", color: "bg-gray-500/10 text-gray-500" },
    { value: "bet_manager", label: "Bet Manager", color: "bg-blue-500/10 text-blue-500" },
    { value: "admin", label: "Admin", color: "bg-purple-500/10 text-purple-500" },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?page=${page}&limit=20`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSetRole = async (userId: string, newRole: string) => {
        setOpenDropdown(null);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    const handleToggleBan = async (user: User) => {
        const action = user.banned ? "unban" : "ban";
        const reason = user.banned ? undefined : prompt("Raison du bannissement:");

        if (!user.banned && !reason) return;

        try {
            const res = await fetch(`/api/admin/users/${user.id}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
            });

            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Error toggling ban:", error);
        }
    };

    const getRoleConfig = (role: string) => {
        return ROLES.find((r) => r.value === role) || ROLES[0];
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-display font-bold mb-2">
                    Gestion des Utilisateurs
                </h2>
                <p className="text-muted-foreground">
                    Gérez les utilisateurs, rôles et bannissements
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-card-border bg-secondary/30">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Utilisateur
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Coins
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Rôle
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-card-border">
                                {users.map((user) => {
                                    const roleConfig = getRoleConfig(user.role);
                                    return (
                                        <tr key={user.id} className="hover:bg-secondary/20">
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-medium">{user.name || "Sans nom"}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-yellow-500 font-medium">
                                                    {user.coins.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {/* Role Dropdown */}
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${roleConfig.color} hover:opacity-80 transition-opacity`}
                                                    >
                                                        {roleConfig.label}
                                                        <ChevronDown className="w-3 h-3" />
                                                    </button>
                                                    {openDropdown === user.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setOpenDropdown(null)}
                                                            />
                                                            <div className="absolute z-20 top-full left-1/2 -translate-x-1/2 mt-1 bg-card border border-card-border rounded-lg shadow-lg py-1 min-w-[140px]">
                                                                {ROLES.map((role) => (
                                                                    <button
                                                                        key={role.value}
                                                                        onClick={() => handleSetRole(user.id, role.value)}
                                                                        className={`w-full px-3 py-2 text-left text-xs hover:bg-secondary transition-colors ${user.role === role.value ? "font-bold" : ""}`}
                                                                    >
                                                                        <span className={`inline-block px-2 py-0.5 rounded ${role.color}`}>
                                                                            {role.label}
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {user.banned ? (
                                                    <span className="px-2 py-1 text-xs font-medium rounded bg-red-500/10 text-red-500">
                                                        Banni
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-500/10 text-green-500">
                                                        Actif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() => handleToggleBan(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.banned
                                                        ? "hover:bg-green-500/10 text-green-500"
                                                        : "hover:bg-red-500/10 text-red-500"
                                                        }`}
                                                    title={user.banned ? "Débannir" : "Bannir"}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 text-sm bg-secondary rounded-lg disabled:opacity-50"
                            >
                                Précédent
                            </button>
                            <span className="text-sm text-muted-foreground">
                                Page {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 text-sm bg-secondary rounded-lg disabled:opacity-50"
                            >
                                Suivant
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

