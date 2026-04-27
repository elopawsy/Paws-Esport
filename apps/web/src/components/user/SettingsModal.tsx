"use client";

import { useState } from "react";
import { Settings, Lock, User, Mail, Loader2, Check, Eye, EyeOff, X, Download, Trash2, AlertTriangle, Database } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string | null;
    userEmail: string;
}

type SettingsSection = "profile" | "security" | "data";

export default function SettingsModal({ isOpen, onClose, userName, userEmail }: SettingsModalProps) {
    // Active section
    const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Name change state
    const [newName, setNewName] = useState(userName || "");
    const [isChangingName, setIsChangingName] = useState(false);
    const [nameSuccess, setNameSuccess] = useState(false);

    // Data management state
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters.");
            return;
        }

        setIsChangingPassword(true);

        try {
            const result = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
            });

            if (result.error) {
                setPasswordError(result.error.message || "Failed to change password.");
            } else {
                setPasswordSuccess(true);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch {
            setPasswordError("An error occurred. Please try again.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleChangeName = async (e: React.FormEvent) => {
        e.preventDefault();
        setNameSuccess(false);
        setIsChangingName(true);

        try {
            const result = await authClient.updateUser({
                name: newName,
            });

            if (result.error) {
                console.error("Error updating name:", result.error);
            } else {
                setNameSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error("Error updating name:", error);
        } finally {
            setIsChangingName(false);
        }
    };

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            const res = await fetch("/api/user/export");
            if (!res.ok) throw new Error("Failed to export data");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "my-data-export.json";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export error:", error);
            alert("An error occurred while exporting your data.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch("/api/user/delete", {
                method: "DELETE",
            });

            if (res.ok) {
                window.location.href = "/";
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete account");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting your account.");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!isOpen) return null;

    const sections = [
        { id: "profile" as const, label: "Profile", icon: User },
        { id: "security" as const, label: "Security", icon: Lock },
        { id: "data" as const, label: "Data & Privacy", icon: Database },
    ];

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-card border border-card-border rounded-lg w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col md:flex-row">
                {/* Sidebar */}
                <div className="md:w-56 bg-background/50 border-b md:border-b-0 md:border-r border-card-border p-4 shrink-0">
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <Settings className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold">Settings</h2>
                    </div>

                    <nav className="flex md:flex-col gap-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left ${activeSection === section.id
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-card-border/50"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{section.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-card-border shrink-0">
                        <h3 className="font-bold text-lg">
                            {sections.find((s) => s.id === activeSection)?.label}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-card-border rounded-md transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Profile Section */}
                        {activeSection === "profile" && (
                            <form onSubmit={handleChangeName} className="space-y-6">
                                <div>
                                    <h4 className="font-medium mb-4">Profile Information</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="block text-sm text-muted-foreground">
                                                Display Name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                placeholder="Your display name"
                                                className="w-full px-4 py-2 bg-background border border-card-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm text-muted-foreground">
                                                Email Address
                                            </label>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-card-border rounded-md">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{userEmail}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Email address cannot be changed.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isChangingName || newName === userName}
                                    className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isChangingName ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : nameSuccess ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Saved!
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Security Section */}
                        {activeSection === "security" && (
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div>
                                    <h4 className="font-medium mb-4">Change Password</h4>

                                    {passwordError && (
                                        <div className="mb-4 px-4 py-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                                            {passwordError}
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="mb-4 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-md flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            Password changed successfully!
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="currentPassword" className="block text-sm text-muted-foreground">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="currentPassword"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                    className="w-full px-4 py-2 pr-10 bg-background border border-card-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="newPassword" className="block text-sm text-muted-foreground">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="newPassword"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                    minLength={8}
                                                    className="w-full px-4 py-2 pr-10 bg-background border border-card-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="confirmPassword" className="block text-sm text-muted-foreground">
                                                Confirm New Password
                                            </label>
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                                className="w-full px-4 py-2 bg-background border border-card-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                                    className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isChangingPassword ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Changing...
                                        </>
                                    ) : (
                                        "Change Password"
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Data & Privacy Section */}
                        {activeSection === "data" && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-medium mb-2">Data Management</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Manage your personal data in compliance with GDPR.
                                    </p>
                                </div>

                                {/* Export Data */}
                                <div className="p-4 bg-background border border-card-border rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Download className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-medium mb-1">Export Your Data</h5>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Download a JSON file containing your profile information, betting history, and friend connections.
                                            </p>
                                            <button
                                                onClick={handleExportData}
                                                disabled={isExporting}
                                                className="px-4 py-2 bg-background border border-primary text-primary hover:bg-primary/10 font-medium rounded-md transition-colors flex items-center gap-2"
                                            >
                                                {isExporting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Exporting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-4 h-4" />
                                                        Download Data
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Account */}
                                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-destructive/10 rounded-lg">
                                            <Trash2 className="w-5 h-5 text-destructive" />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-medium text-destructive mb-1">Delete Account</h5>
                                            <p className="text-sm text-destructive/80 mb-3">
                                                Permanently delete your account and all associated data. This action is irreversible.
                                            </p>

                                            {!showDeleteConfirm ? (
                                                <button
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium rounded-md transition-colors"
                                                >
                                                    Delete Account
                                                </button>
                                            ) : (
                                                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                                                    <div className="flex items-center gap-2 text-destructive font-bold mb-3">
                                                        <AlertTriangle className="w-5 h-5" />
                                                        Are you absolutely sure?
                                                    </div>
                                                    <p className="text-sm text-destructive/80 mb-4">
                                                        This will permanently delete your account, all your bets, and remove you from all friend lists.
                                                    </p>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(false)}
                                                            className="px-4 py-2 bg-background border border-card-border hover:bg-card-border/50 text-foreground rounded-md transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleDeleteAccount}
                                                            disabled={isDeleting}
                                                            className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-md transition-colors flex items-center gap-2"
                                                        >
                                                            {isDeleting ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    Deleting...
                                                                </>
                                                            ) : (
                                                                "Yes, Delete My Account"
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
