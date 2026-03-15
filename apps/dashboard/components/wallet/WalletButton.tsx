"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "./UserDropdown";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function WalletButton() {
  const { isConnected, isConnecting } = useAccount();
  const { openConnectModal } = useConnectModal();

  if (isConnected) {
    return <UserDropdown />;
  }

  return (
    <Button
      onClick={() => openConnectModal?.()}
      className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium px-4 h-10 rounded-md gap-2"
      disabled={isConnecting}
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
