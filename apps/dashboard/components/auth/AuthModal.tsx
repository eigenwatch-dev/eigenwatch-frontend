"use client";

import useAuthStore from "@/hooks/store/useAuthStore";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { SignStep } from "./SignStep";
import { EmailStep } from "./EmailStep";
import { VerifyStep } from "./VerifyStep";

export function AuthModal() {
  const { showAuthModal, closeAuthModal, authStep } = useAuthStore();

  // During sign step, modal is not dismissible
  const canDismiss = authStep !== "sign";

  return (
    <Dialog
      open={showAuthModal}
      onOpenChange={(open) => {
        if (!open && canDismiss) {
          closeAuthModal();
        }
      }}
    >
      <DialogContent
        showCloseButton={canDismiss}
        className="bg-card border-border sm:max-w-md"
        onInteractOutside={(e) => {
          if (!canDismiss) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!canDismiss) e.preventDefault();
        }}
      >
        {authStep === "sign" && <SignStep />}
        {authStep === "email" && <EmailStep />}
        {authStep === "verify" && <VerifyStep />}
      </DialogContent>
    </Dialog>
  );
}
