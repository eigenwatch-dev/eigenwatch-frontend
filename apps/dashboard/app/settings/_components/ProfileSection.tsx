"use client";

import { useState } from "react";
import useAuthStore from "@/hooks/store/useAuthStore";
import { updateProfile } from "@/lib/auth-api";
import { Copy, CheckCircle2 } from "lucide-react";

export function ProfileSection() {
  const { user, accessToken, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasChanges = displayName !== (user?.display_name || "");

  const copyAddress = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const updated = await updateProfile(
        { display_name: displayName || undefined },
        accessToken
      );
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // TODO: toast error
    } finally {
      setSaving(false);
    }
  };

  const tierLabel: Record<string, string> = {
    free: "Free Plan",
    pro: "Pro Plan",
    enterprise: "Enterprise Plan",
  };

  const tierColor: Record<string, string> = {
    free: "text-muted-foreground bg-muted",
    pro: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    enterprise: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your wallet identity and account information.
          </p>
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Wallet Address
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border border-border bg-muted/50 px-3 py-2">
              <span className="font-mono text-sm text-foreground">
                {user?.wallet_address}
              </span>
            </div>
            <button
              onClick={copyAddress}
              className="rounded-md border border-border p-2 hover:bg-muted transition-colors"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Display Name
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter a display name"
            maxLength={50}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Member Since */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Member Since
          </label>
          <p className="text-sm text-muted-foreground">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"}
          </p>
        </div>

        {/* Account Tier */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Account Tier
          </label>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${tierColor[user?.tier || "free"] || tierColor.free}`}
            >
              {tierLabel[user?.tier || "free"] || "Free Plan"}
            </span>
            {user?.tier === "free" && (
              <button className="text-xs text-blue-400 hover:underline">
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
          </button>
          {saved && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Changes saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
