"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { Shield } from "lucide-react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useAuthStore from "@/hooks/store/useAuthStore";
import Link from "next/link";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";

const websiteUrl =
  process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export function ConnectStep() {
  const { setAuthStep } = useAuthStore();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  React.useEffect(() => {
    if (isConnected) {
      setAuthStep("sign");
    }
  }, [isConnected, setAuthStep]);

  return (
    <div className="space-y-6">
      <DialogHeader className="items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
          <Shield className="h-6 w-6 text-blue-500" />
        </div>
        <DialogTitle className="text-center">Connect Wallet</DialogTitle>
        <DialogDescription className="text-center">
          Connect your wallet to EigenWatch to get started.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3 py-4">
        <Button
          onClick={() => openConnectModal?.()}
          size="lg"
          className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium h-12 rounded-lg text-base"
        >
          Connect Wallet
        </Button>
      </div>

      <p className="text-[10px] text-[#A1A1AA] text-center px-4">
        By connecting a wallet, you agree to EigenWatch&apos;s{" "}
        <Link
          href={`${websiteUrl}/terms`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white transition-colors"
        >
          Terms of Service
        </Link>
      </p>
    </div>
  );
}
