"use client";

import { useState, useRef } from "react";
import useAuthStore from "@/hooks/store/useAuthStore";
import {
  addEmail,
  verifyEmail,
  removeEmail,
  setPrimaryEmail,
  resendVerification,
  getMe,
} from "@/lib/auth-api";
import {
  Mail,
  Plus,
  X,
  CheckCircle2,
  Clock,
  Star,
  Loader2,
} from "lucide-react";
import { UserEmail } from "@/types/auth.types";

export function EmailsSection() {
  const { user, accessToken, setUser } = useAuthStore();
  const [newEmail, setNewEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);
  const [verifyingEmailId, setVerifyingEmailId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emails = user?.emails || [];
  const canAddMore = emails.length < 3;

  const refreshUser = async () => {
    try {
      const updated = await getMe(accessToken);
      setUser(updated);
    } catch {
      // Silently fail
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setAddingEmail(true);
    try {
      await addEmail(newEmail, accessToken);
      await refreshUser();
      setNewEmail("");
      // Auto-open verification for the newly added email
      const updatedUser = await getMe(accessToken);
      setUser(updatedUser);
      const added = updatedUser.emails?.find(
        (e: UserEmail) => e.email === newEmail && !e.is_verified
      );
      if (added) {
        setVerifyingEmailId(added.id);
        setVerifyCode(["", "", "", "", "", ""]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add email";
      setError(message);
    } finally {
      setAddingEmail(false);
    }
  };

  const handleVerify = async () => {
    const code = verifyCode.join("");
    if (code.length !== 6) return;
    setError("");
    try {
      await verifyEmail(verifyingEmailId!, code, accessToken);
      await refreshUser();
      setVerifyingEmailId(null);
      setVerifyCode(["", "", "", "", "", ""]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid verification code";
      setError(message);
    }
  };

  const handleResend = async (emailId: string) => {
    try {
      await resendVerification(emailId, accessToken);
    } catch {
      // Silently fail
    }
  };

  const handleRemove = async (emailId: string) => {
    setRemovingId(emailId);
    try {
      await removeEmail(emailId, accessToken);
      await refreshUser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove email";
      setError(message);
    } finally {
      setRemovingId(null);
    }
  };

  const handleSetPrimary = async (emailId: string) => {
    try {
      await setPrimaryEmail(emailId, accessToken);
      await refreshUser();
    } catch {
      // Silently fail
    }
  };

  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...verifyCode];
    next[index] = value.slice(-1);
    setVerifyCode(next);
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      setTimeout(() => handleVerify(), 100);
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setVerifyCode(pasted.split(""));
      codeRefs.current[5]?.focus();
      setTimeout(() => handleVerify(), 100);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verifyCode[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Email Addresses
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your email addresses for notifications and alerts.
          </p>
        </div>

        {/* Email list */}
        {emails.length > 0 ? (
          <div className="rounded-md border border-border divide-y divide-border">
            {emails.map((email) => (
              <div
                key={email.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">
                    {email.email}
                  </span>
                  {email.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2 py-0.5">
                      <Clock className="h-3 w-3" />
                      Unverified
                    </span>
                  )}
                  {email.is_primary && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
                      <Star className="h-3 w-3" />
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!email.is_verified && (
                    <button
                      onClick={() => {
                        setVerifyingEmailId(email.id);
                        setVerifyCode(["", "", "", "", "", ""]);
                        handleResend(email.id);
                      }}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Verify
                    </button>
                  )}
                  {email.is_verified && !email.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(email.id)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      title="Set as primary"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(email.id)}
                    disabled={removingId === email.id}
                    className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Remove email"
                  >
                    {removingId === email.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-muted/30 p-6 text-center space-y-2">
            <Mail className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium text-foreground">
              No email addresses added
            </p>
            <p className="text-xs text-muted-foreground">
              Add an email to receive risk alerts, watchlist notifications, and
              important account updates.
            </p>
          </div>
        )}

        {/* Inline verification */}
        {verifyingEmailId && (
          <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-sm text-foreground">
              Enter the 6-digit code sent to your email.
            </p>
            <div
              className="flex gap-2 justify-start"
              onPaste={handleCodePaste}
            >
              {verifyCode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    codeRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className="w-10 h-10 text-center rounded-md border border-border bg-background text-foreground text-lg font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setVerifyingEmailId(null);
                  setVerifyCode(["", "", "", "", "", ""]);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResend(verifyingEmailId)}
                className="text-xs text-blue-400 hover:underline"
              >
                Resend code
              </button>
            </div>
          </div>
        )}

        {/* Add email */}
        {canAddMore && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setError("");
                }}
                placeholder="new@email.com"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
              />
              <button
                onClick={handleAddEmail}
                disabled={addingEmail || !newEmail}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Email
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can add up to 3 email addresses. ({3 - emails.length} remaining)
            </p>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
