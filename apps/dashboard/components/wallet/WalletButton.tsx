"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectWalletDialog } from "./ConnectWalletDialog";
import { UserDropdown } from "./UserDropdown";

export function WalletButton() {
  const { isConnected, isConnecting } = useAccount();
  const [open, setOpen] = React.useState(false);

  if (isConnected) {
    return <UserDropdown />;
  }

  return (
    <ConnectWalletDialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium px-4 h-10 rounded-md gap-2"
        disabled={isConnecting}
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    </ConnectWalletDialog>
  );
}
