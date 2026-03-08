"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitFeedback } from "@/lib/auth-api";

const PAYWALL_OPTIONS = [
  { id: "risk_breakdown", label: "Detailed risk breakdown" },
  { id: "slashing_modeling", label: "Slashing probability" },
  { id: "validator_data", label: "Validator-level data" },
  { id: "alerts", label: "Real-time alerts" },
  { id: "portfolio_risk", label: "Portfolio risk score" },
  { id: "yield_analysis", label: "Risk-adjusted yield" },
] as const;

interface PaywallFeedbackProps {
  feature: string;
}

export function PaywallFeedback({ feature }: PaywallFeedbackProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");

  const toggleOption = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;

    setState("submitting");
    try {
      await submitFeedback({
        type: "PAYWALL",
        page_url: window.location.pathname,
        metadata: {
          feature,
          expected: Array.from(selected),
        },
      });
    } catch {
      // Silent fail
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
        <Check className="size-3 text-green-500" />
        <span>Thanks! We'll prioritize based on your feedback.</span>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2.5">
      <p className="text-xs text-muted-foreground text-center">
        What were you hoping to see?
      </p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {PAYWALL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggleOption(opt.id)}
            className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors duration-150 ${
              selected.has(opt.id)
                ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-highlight-border"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {selected.size > 0 && (
        <div className="flex justify-center">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={state === "submitting"}
            className="h-7 text-xs bg-purple-500 hover:bg-purple-500/90 text-white"
          >
            {state === "submitting" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
