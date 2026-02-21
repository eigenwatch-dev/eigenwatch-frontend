"use client";

import useAuthStore from "@/hooks/store/useAuthStore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConnectStep } from "./ConnectStep";
import { SignStep } from "./SignStep";
import { EmailStep } from "./EmailStep";
import { VerifyStep } from "./VerifyStep";

export function AuthModal() {
  const { showAuthModal, closeAuthModal, authStep } = useAuthStore();

  // Modal is dismissible during connect step, but not during signing
  const canDismiss = authStep === "connect" || authStep !== "sign";

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
        {authStep === "connect" && <ConnectStep />}
        {authStep === "sign" && <SignStep />}
        {authStep === "email" && <EmailStep />}
        {authStep === "verify" && <VerifyStep />}
      </DialogContent>
    </Dialog>
  );
}
