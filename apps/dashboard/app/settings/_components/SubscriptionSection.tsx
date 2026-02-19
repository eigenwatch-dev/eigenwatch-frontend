"use client";

import useAuthStore from "@/hooks/store/useAuthStore";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { FeatureComingSoonModal } from "@/components/shared/FeatureComingSoonModal";

const FREE_FEATURES = [
  "View operator summaries and aggregates",
  "Basic risk level indicators",
  "Public data access",
  "Operator search and filtering",
];

const PRO_FEATURES = [
  "Full risk analysis & scores",
  "Detailed strategy & allocation tables",
  "Delegator intelligence",
  "Commission behavior history",
  "Operator comparison tools",
  "Watchlist with alerts",
  "Priority API access",
];

export function SubscriptionSection() {
  const { user } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const isPro = user?.tier === "pro" || user?.tier === "enterprise";

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Subscription
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your current plan and available upgrades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free Plan */}
          <div
            className={`rounded-lg border p-5 space-y-4 ${
              !isPro
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Free Plan</h3>
              {!isPro && (
                <span className="text-xs text-green-500 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
                  Current
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div
            className={`rounded-lg border p-5 space-y-4 ${
              isPro
                ? "border-blue-500/50 bg-blue-500/5"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Pro Plan</h3>
              {isPro ? (
                <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
                  Current
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Coming soon
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
            {!isPro && (
              <button
                onClick={() => setModalOpen(true)}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          For Enterprise plans, contact{" "}
          <span className="text-foreground">sales@eigenwatch.xyz</span>
        </p>
      </div>

      <FeatureComingSoonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureName="Pro Plan"
        benefits="Full risk analysis, detailed strategy tables, delegator intelligence, commission behavior history, operator comparison tools, watchlist with alerts, and priority API access."
      />
    </div>
  );
}
