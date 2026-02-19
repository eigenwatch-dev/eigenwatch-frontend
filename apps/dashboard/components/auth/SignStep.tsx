"use client";

import { useState } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useAuthStore from "@/hooks/store/useAuthStore";
import { getNonce, verifySignature } from "@/lib/auth-api";

export function SignStep() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { setUser, setAccessToken, setAuthStep, setAuthenticating } =
    useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  async function handleSign() {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const { message, nonce } = await getNonce(address);
      const signature = await signMessageAsync({ message });
      const data = await verifySignature(address, signature, nonce);

      setAccessToken(data.tokens.access_token);
      setUser(data.user);
      setAuthStep("email");
    } catch (err) {
      if (err instanceof Error && err.message.includes("User rejected")) {
        setError("Signature rejected. Please try again.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleSwitchWallet() {
    disconnect();
  }

  return (
    <div className="space-y-6">
      <DialogHeader className="items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
          <Shield className="h-6 w-6 text-blue-500" />
        </div>
        <DialogTitle className="text-center">Sign in to EigenWatch</DialogTitle>
        <DialogDescription className="text-center">
          Verify your wallet ownership by signing a message. This does not cost
          any gas or make a transaction.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center justify-center">
        <span className="font-mono text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
          {truncatedAddress}
        </span>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <div className="space-y-3">
        <Button className="w-full" onClick={handleSign} disabled={isLoading}>
          {isLoading ? "Waiting for signature..." : "Sign Message"}
        </Button>

        <button
          type="button"
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          onClick={handleSwitchWallet}
        >
          Use a different wallet
        </button>
      </div>
    </div>
  );
}
