"use client";

import { useCallback } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { markBetaPerkSeen } from "@/lib/auth-api";
import type { UnseenBetaPerk } from "@/types/auth.types";

interface BetaPerkModalProps {
  perk: UnseenBetaPerk | null;
  open: boolean;
  onDismiss: () => void;
}

const PERK_MESSAGES: Record<
  string,
  { title: string; description: string }
> = {
  free_pro_month: {
    title: "Welcome to the Beta Program!",
    description:
      "You've been granted 1 month of free PRO access as a beta member. Enjoy advanced risk metrics, detailed strategy insights, and priority access.",
  },
  discounted_pro: {
    title: "Beta Discount Activated!",
    description:
      "As a beta member, you now have access to a discounted PRO plan. Check the upgrade page for your special pricing.",
  },
};

const DEFAULT_MESSAGE = {
  title: "Beta Perk Activated!",
  description:
    "A new beta perk has been activated for your account. Thank you for being part of the beta program!",
};

export function BetaPerkModal({ perk, open, onDismiss }: BetaPerkModalProps) {
  const handleDismiss = useCallback(async () => {
    if (perk) {
      try {
        await markBetaPerkSeen(perk.id);
      } catch {
        // Don't block dismissal on API failure
      }
    }
    onDismiss();
  }, [perk, onDismiss]);

  if (!perk) return null;

  const message = PERK_MESSAGES[perk.key] || DEFAULT_MESSAGE;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDismiss()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
            <Sparkles className="h-7 w-7 text-blue-500" />
          </div>
          <DialogTitle className="text-xl">{message.title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {message.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all text-sm"
          >
            Got it!
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
