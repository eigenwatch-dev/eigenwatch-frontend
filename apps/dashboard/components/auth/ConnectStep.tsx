"use client";

import * as React from "react";
import { useConnect, useAccount } from "wagmi";
import { Loader2, Shield } from "lucide-react";
import { WalletMetamask, WalletWalletConnect } from "@web3icons/react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useAuthStore from "@/hooks/store/useAuthStore";
import Link from "next/link";

const websiteUrl =
  process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

const WALLET_ICONS: Record<string, React.ReactNode> = {
  MetaMask: <WalletMetamask variant="branded" size={24} />,
  WalletConnect: <WalletWalletConnect variant="branded" size={24} />,
};

export function ConnectStep() {
  const { connectors, connect, status } = useConnect();
  const { isConnected } = useAccount();
  const { setAuthStep } = useAuthStore();
  const [pendingConnectorId, setPendingConnectorId] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    if (isConnected) {
      setAuthStep("sign");
    }
  }, [isConnected, setAuthStep]);

  const handleConnect = (connector: any) => {
    if (connector.isVirtual && connector.name === "MetaMask") {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setPendingConnectorId(connector.uid);
    connect({ connector });
  };

  const isMetaMaskInstalled =
    typeof window !== "undefined" && !!(window as any).ethereum?.isMetaMask;

  // Sort and deduplicate connectors
  const sortedConnectors = [...connectors].sort((a, b) => {
    // 1. Identify "injected" or similar that are "Installed"
    const isAInstalled = (a as any).name.toLowerCase().includes("metamask")
      ? isMetaMaskInstalled
      : !a.isVirtual && !a.name.includes("Wave");
    const isBInstalled = (b as any).name.toLowerCase().includes("metamask")
      ? isMetaMaskInstalled
      : !b.isVirtual && !b.name.includes("Wave");

    const isAWalletConnect = a.name.includes("WalletConnect");
    const isBWalletConnect = b.name.includes("WalletConnect");

    // 2. Sorting rules:
    // a. Installed wallets (not WC) go to the very top.
    // b. WalletConnect goes after installed.
    // c. Rest (virtual/uninstalled) go to the bottom.

    if (
      isAInstalled &&
      !isAWalletConnect &&
      (!isBInstalled || isBWalletConnect)
    )
      return -1;
    if (
      isBInstalled &&
      !isBWalletConnect &&
      (!isAInstalled || isAWalletConnect)
    )
      return 1;

    if (isAWalletConnect && !isBWalletConnect) {
      if (isBInstalled) return 1;
      return -1;
    }
    if (isBWalletConnect && !isAWalletConnect) {
      if (isAInstalled) return -1;
      return 1;
    }

    return 0;
  });

  const deduplicatedConnectors = Array.from(
    new Map(
      sortedConnectors
        .filter((c) => c.name !== "Injected")
        .map((c) => [c.name, c]),
    ).values(),
  );

  const displayConnectors = deduplicatedConnectors;

  const getIcon = (connector: any) => {
    if (connector.icon) {
      return (
        <img src={connector.icon} alt={connector.name} className="w-6 h-6" />
      );
    }
    if (connector.name.includes("MetaMask")) return WALLET_ICONS.MetaMask;
    if (connector.name.includes("WalletConnect"))
      return WALLET_ICONS.WalletConnect;
    return (
      <WalletMetamask variant="branded" size={24} className="opacity-50" />
    );
  };

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

      <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
        {displayConnectors.length > 0 ? (
          displayConnectors.map((connector: any) => {
            const isMetaMask = connector.name
              .toLowerCase()
              .includes("metamask");
            const isInstalled =
              (isMetaMask && isMetaMaskInstalled) ||
              (!isMetaMask &&
                !connector.isVirtual &&
                !connector.name.includes("Wave"));

            return (
              <button
                key={connector.uid}
                disabled={status === "pending" && !connector.isVirtual}
                onClick={() => handleConnect(connector)}
                className="flex items-center justify-between w-full p-4 rounded-lg bg-[#18181B] border border-white/5 hover:border-white/10 hover:bg-[#27272A] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    {getIcon(connector)}
                  </div>
                  <span className="font-medium text-white">
                    {connector.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isInstalled && !connector.isVirtual && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A1A1AA] bg-white/5 px-1.5 py-0.5 rounded">
                      Installed
                    </span>
                  )}
                  {connector.isVirtual && isMetaMask && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      Install
                    </span>
                  )}
                  {status === "pending" &&
                    pendingConnectorId === connector.uid && (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center text-[#A1A1AA] py-4">
            No supported connectors found.
          </div>
        )}
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
