"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/hooks/store/useAuthStore";
import { deleteAccount } from "@/lib/auth-api";
import { AlertTriangle, Loader2 } from "lucide-react";

export function DangerZone() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      router.push("/");
    } catch {
      // TODO: toast error
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-red-500/20 bg-card">
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            Delete Account
          </h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
        </div>

        {!confirmOpen ? (
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-500">
                This will permanently delete your account, email addresses,
                preferences, and all session data. Type <strong>DELETE</strong>{" "}
                to confirm.
              </p>
            </div>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full rounded-md border border-red-500/30 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-red-500/50"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || deleting}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Permanently Delete
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmText("");
                }}
                className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
