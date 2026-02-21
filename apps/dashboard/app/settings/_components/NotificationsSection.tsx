"use client";

import { useState, useEffect } from "react";
import useAuthStore from "@/hooks/store/useAuthStore";
import { getPreferences, updatePreferences } from "@/lib/auth-api";
import { Switch } from "@/components/ui/switch";
import { ProBadge, ComingSoonBadge } from "@/components/shared/ProGate";
import { useProAccess } from "@/hooks/useProAccess";
import { UserPreferences } from "@/types/auth.types";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

const DEFAULT_PREFS: UserPreferences = {
  risk_alerts_operator_changes: true,
  risk_alerts_slashing: true,
  risk_alerts_tvs_changes: false,
  watchlist_daily_summary: false,
  watchlist_status_changes: false,
  product_updates: true,
  newsletter: false,
};

export function NotificationsSection() {
  const { user } = useAuthStore();
  const { isFree } = useProAccess();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasVerifiedEmail = user?.emails?.some((e) => e.is_verified) ?? false;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getPreferences();
        if (!cancelled) setPrefs(data);
      } catch {
        // Use defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = (key: keyof UserPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // TODO: toast error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Notification Preferences
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose what you&apos;d like to be notified about.
          </p>
        </div>

        {!hasVerifiedEmail && (
          <div className="flex items-start gap-2 rounded-md border border-yellow-500/20 bg-yellow-500/5 p-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-500">
              Email required for notifications. Add and verify an email in the
              Emails section to enable these settings.
            </p>
          </div>
        )}

        {/* Risk Alerts */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Risk Alerts</h3>
          <div className="space-y-3">
            <ToggleRow
              label="Operator risk level changes"
              checked={prefs.risk_alerts_operator_changes}
              onChange={() => handleToggle("risk_alerts_operator_changes")}
              disabled={!hasVerifiedEmail}
              comingSoon
            />
            <ToggleRow
              label="Slashing events detected"
              checked={prefs.risk_alerts_slashing}
              onChange={() => handleToggle("risk_alerts_slashing")}
              disabled={!hasVerifiedEmail}
              comingSoon
            />
            <ToggleRow
              label="Significant TVS changes (>10%)"
              checked={prefs.risk_alerts_tvs_changes}
              onChange={() => handleToggle("risk_alerts_tvs_changes")}
              disabled={!hasVerifiedEmail}
              comingSoon
            />
          </div>
        </div>

        {/* Watchlist */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Watchlist</h3>
            <ProBadge />
          </div>
          <div className="space-y-3">
            <ToggleRow
              label="Daily watchlist summary"
              checked={prefs.watchlist_daily_summary}
              onChange={() => handleToggle("watchlist_daily_summary")}
              disabled={!hasVerifiedEmail || isFree}
              comingSoon
            />
            <ToggleRow
              label="Watchlist operator status changes"
              checked={prefs.watchlist_status_changes}
              onChange={() => handleToggle("watchlist_status_changes")}
              disabled={!hasVerifiedEmail || isFree}
              comingSoon
            />
          </div>
        </div>

        {/* Product Updates */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            Product Updates
          </h3>
          <div className="space-y-3">
            <ToggleRow
              label="New features and product announcements"
              checked={prefs.product_updates}
              onChange={() => handleToggle("product_updates")}
              disabled={!hasVerifiedEmail}
            />
            <ToggleRow
              label="EigenWatch newsletter"
              checked={prefs.newsletter}
              onChange={() => handleToggle("newsletter")}
              disabled={!hasVerifiedEmail}
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !hasVerifiedEmail}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
          {saved && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Preferences saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
  comingSoon,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`text-sm ${disabled || comingSoon ? "text-muted-foreground" : "text-foreground"}`}
        >
          {label}
        </span>
        {comingSoon && <ComingSoonBadge />}
      </div>
      <Switch
        checked={comingSoon ? false : checked}
        onCheckedChange={onChange}
        disabled={disabled || comingSoon}
      />
    </div>
  );
}
