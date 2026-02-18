"use client";

import { useState, useRef, useEffect } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useAuthStore from "@/hooks/store/useAuthStore";
import { verifyEmail, resendVerification } from "@/lib/auth-api";

const CODE_LENGTH = 6;

export function VerifyStep() {
  const { user, closeAuthModal, setUser } = useAuthStore();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const pendingEmail = user?.emails?.find((e) => !e.is_verified)?.email || "";

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const digit = value.slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === CODE_LENGTH - 1 && newCode.every((d) => d)) {
      handleVerify(newCode.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;

    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i] ?? "";
    }
    setCode(newCode);

    const nextEmpty = newCode.findIndex((d) => !d);
    const focusIndex = nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();

    if (newCode.every((d) => d)) {
      handleVerify(newCode.join(""));
    }
  }

  async function handleVerify(fullCode: string) {
    if (!pendingEmail) {
      console.error("VerifyStep: No pending email found");
      setError(
        "No email address found to verify. Please try logging in again.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verifyEmail(pendingEmail, fullCode);
      // Refresh user data to reflect verified email
      if (user) {
        const currentEmails = user.emails || [];
        const updatedEmails = currentEmails.map((e) =>
          e.email === pendingEmail ? { ...e, is_verified: true } : e,
        );
        setUser({ ...user, emails: updatedEmails });
      }
      closeAuthModal();
    } catch {
      setError("Invalid code. Please try again.");
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!pendingEmail || resendCooldown > 0) return;

    try {
      await resendVerification(pendingEmail);
      setResendCooldown(60);
      setError(null);
    } catch {
      setError("Failed to resend code.");
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
        <DialogTitle className="text-center">Verify Your Email</DialogTitle>
        <DialogDescription className="text-center">
          We sent a 6-digit code to{" "}
          <span className="text-foreground font-medium">{pendingEmail}</span>
        </DialogDescription>
      </DialogHeader>

      {/* Code input boxes */}
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-12 w-10 rounded-md border border-input bg-card text-center text-lg font-mono text-foreground focus:border-ring focus:ring-ring/50 focus:ring-[3px] outline-none transition-[color,box-shadow]"
            disabled={isLoading}
          />
        ))}
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <div className="text-center">
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          onClick={handleResend}
          disabled={resendCooldown > 0}
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Didn't receive it? Resend code"}
        </button>
      </div>

      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={() => handleVerify(code.join(""))}
          disabled={!code.every((d) => d) || isLoading}
        >
          {isLoading ? "Verifying..." : "Verify"}
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
