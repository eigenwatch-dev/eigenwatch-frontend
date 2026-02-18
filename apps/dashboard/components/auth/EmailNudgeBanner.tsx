"use client";

import { useState, useEffect } from "react";
import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/hooks/store/useAuthStore";

const DISMISS_KEY = "eigenwatch_email_nudge_dismissed";
const NUDGE_REAPPEAR_DAYS = 7;

export function EmailNudgeBanner() {
  const { isAuthenticated, user } = useAuthStore();
  const [dismissed, setDismissed] = useState(true);

  const hasVerifiedEmail = user?.emails?.some((e) => e.is_verified);

  useEffect(() => {
    if (!isAuthenticated || hasVerifiedEmail) {
      setDismissed(true);
      return;
    }

    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) {
      // Don't show on first session — give user space
      const created = user?.created_at
        ? new Date(user.created_at).getTime()
        : 0;
      const now = Date.now();
      const isFirstSession = now - created < 60_000; // within 1 minute of account creation
      setDismissed(isFirstSession);
      return;
    }

    const dismissedAt = parseInt(stored, 10);
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    setDismissed(daysSince < NUDGE_REAPPEAR_DAYS);
  }, [isAuthenticated, hasVerifiedEmail, user?.created_at]);

  if (dismissed || !isAuthenticated || hasVerifiedEmail) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setDismissed(true);
  }

  function handleAddEmail() {
    // Navigate to settings email section
    window.location.href = "/settings?section=emails";
  }

  return (
    <div className="w-full bg-blue-500/10 border-b border-blue-500/20">
      <div className="max-w-[1440px] mx-auto px-[108px] py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-4 w-4 text-blue-500 shrink-0" />
          <span className="text-muted-foreground">
            Add your email to receive risk alerts and updates.
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 h-7 px-2.5"
            onClick={handleAddEmail}
          >
            Add Email
          </Button>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
