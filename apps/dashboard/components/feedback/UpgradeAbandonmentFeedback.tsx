"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedback } from "@/lib/auth-api";

const ABANDONMENT_REASONS = [
  { id: "price_too_high", label: "Pricing is too high" },
  { id: "payment_method", label: "Preferred payment method not available" },
  { id: "not_sure_value", label: "Not sure it's worth it yet" },
  { id: "just_browsing", label: "Just browsing" },
  { id: "need_more_info", label: "Need more info before deciding" },
  { id: "other", label: "Other" },
] as const;

interface UpgradeAbandonmentFeedbackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeAbandonmentFeedback({
  open,
  onOpenChange,
}: UpgradeAbandonmentFeedbackProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"form" | "submitting" | "done">("form");

  const handleSubmit = async () => {
    if (!selected) return;

    setState("submitting");
    try {
      await submitFeedback({
        type: "PAYWALL",
        category: selected,
        message: message.trim() || undefined,
        page_url: window.location.pathname,
        metadata: { context: "upgrade_abandonment" },
      });
    } catch {
      // Silent fail
    }
    setState("done");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSelected(null);
      setMessage("");
      setState("form");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        {state === "done" ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto size-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="size-5 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Thanks for letting us know
              </p>
              <p className="text-xs text-muted-foreground">
                We use this to make Pro better for everyone.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">
                Quick question before you go
              </DialogTitle>
              <DialogDescription>
                What held you back from upgrading?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                {ABANDONMENT_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() =>
                      setSelected(selected === reason.id ? null : reason.id)
                    }
                    className={`px-3 py-2 text-xs text-left rounded-md border transition-colors duration-150 ${
                      selected === reason.id
                        ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                        : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-highlight-border"
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>

              {selected === "other" && (
                <Textarea
                  placeholder="Tell us more..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[60px] resize-none bg-background text-xs"
                  maxLength={500}
                  autoFocus
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-muted-foreground"
              >
                Skip
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!selected || state === "submitting"}
                className="bg-purple-500 hover:bg-purple-500/90 text-white"
              >
                {state === "submitting" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
