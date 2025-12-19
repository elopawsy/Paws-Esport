"use client";

import { useState } from "react";
import { Download, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function DataManagement() {
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
                // Force page reload to clear state/auth, or redirect
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

    return (
        <div className="bg-card border border-card-border rounded-lg p-6 lg:col-span-2 mt-6">
            <h3 className="text-xl font-bold mb-4">Data Management</h3>
            <p className="text-muted-foreground mb-6">
                Manage your personal data in compliance with GDPR. You can export a copy of all data we hold about you, or permanently delete your account.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
                {/* Export Data */}
                <div className="p-4 bg-background border border-card-border rounded-lg flex flex-col justify-between gap-4">
                    <div>
                        <h4 className="font-bold flex items-center gap-2 mb-2">
                            <Download className="w-5 h-5 text-primary" />
                            Export Your Data
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Download a JSON file containing your profile information, betting history, and friend connections.
                        </p>
                    </div>
                    <button
                        onClick={handleExportData}
                        disabled={isExporting}
                        className="w-full py-2 bg-background border border-primary text-primary hover:bg-primary/10 font-medium rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            "Download Data"
                        )}
                    </button>
                </div>

                {/* Delete Account */}
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg flex flex-col justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-destructive flex items-center gap-2 mb-2">
                            <Trash2 className="w-5 h-5" />
                            Delete Account
                        </h4>
                        <p className="text-sm text-destructive/80">
                            Permanently delete your account and all associated data. This action is irreversible.
                        </p>
                    </div>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium rounded-md transition-colors"
                        >
                            Delete Account
                        </button>
                    ) : (
                        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2 text-sm font-bold text-destructive mb-2 justify-center">
                                <AlertTriangle className="w-4 h-4" />
                                Are you sure?
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-1.5 bg-background border border-card-border hover:bg-card-border/50 text-foreground text-sm rounded transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                    className="flex-1 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-bold rounded transition-colors flex items-center justify-center"
                                >
                                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
