"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import useAuthStore from "@/hooks/store/useAuthStore";
import { addEmail } from "@/lib/auth-api";

export function EmailStep() {
  const { accessToken, setAuthStep, closeAuthModal } = useAuthStore();
  const [email, setEmail] = useState("");
  const [riskAlerts, setRiskAlerts] = useState(false);
  const [productUpdates, setProductUpdates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit() {
    if (!accessToken || !isValidEmail) return;

    setIsLoading(true);
    setError(null);

    try {
      await addEmail(accessToken, email, {
        risk_alerts: riskAlerts,
        marketing: productUpdates,
      });
      setAuthStep("verify");
    } catch {
      setError("Failed to add email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSkip() {
    closeAuthModal();
  }

  return (
    <div className="space-y-6">
      <DialogHeader className="items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
          <Mail className="h-6 w-6 text-blue-500" />
        </div>
        <DialogTitle className="text-center">Stay Informed</DialogTitle>
        <DialogDescription className="text-center">
          Add your email to receive risk alerts and important updates.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="risk-alerts"
              checked={riskAlerts}
              onCheckedChange={(checked) =>
                setRiskAlerts(checked === true)
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="risk-alerts"
              className="text-sm text-muted-foreground font-normal leading-snug cursor-pointer"
            >
              Send me risk alerts for my watchlist operators
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="product-updates"
              checked={productUpdates}
              onCheckedChange={(checked) =>
                setProductUpdates(checked === true)
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="product-updates"
              className="text-sm text-muted-foreground font-normal leading-snug cursor-pointer"
            >
              Send me EigenWatch product updates and announcements
            </Label>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!isValidEmail || isLoading}
        >
          {isLoading ? "Sending..." : "Continue"}
        </Button>

        <button
          type="button"
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          onClick={handleSkip}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
