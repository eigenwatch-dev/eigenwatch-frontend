"use client";

import * as React from "react";
import { useConnect } from "wagmi";
import { Loader2 } from "lucide-react";
import { WalletMetamask, WalletWalletConnect } from "@web3icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConnectWalletDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const WALLET_ICONS: Record<string, React.ReactNode> = {
  MetaMask: <WalletMetamask variant="branded" size={24} />,
  WalletConnect: <WalletWalletConnect variant="branded" size={24} />,
};

export function ConnectWalletDialog({
  children,
  open,
  onOpenChange,
}: ConnectWalletDialogProps) {
  const { connectors, connect, status, error } = useConnect();
  const [pendingConnectorId, setPendingConnectorId] = React.useState<
    string | null
  >(null);

  const handleConnect = (connector: any) => {
    if (connector.isVirtual && connector.name === "MetaMask") {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    connect({ connector });
  };

  // Improved check for MetaMask installed
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

  // Deduplicate by name to avoid showing multiple "Injected" or similar
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[400px] bg-[#09090B] border border-white/10 p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-white text-center">
            Connect your wallet
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2 flex flex-col gap-3 max-h-[320px] overflow-y-auto custom-scrollbar">
          {displayConnectors.length > 0 ? (
            displayConnectors.map((connector: any) => {
              const isMetaMask = connector.name
                .toLowerCase()
                .includes("metamask");
              const isInstalled =
                (isMetaMask && isMetaMaskInstalled) ||
                (!isMetaMask &&
                  !connector.isVirtual &&
                  !connector.name.includes("Wave")); // Simplified logic for other injected

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
                    {status === "success" &&
                      pendingConnectorId === connector.uid && (
                        <div className="text-xs text-green-500 font-medium">
                          Connected
                        </div>
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
          {error && (
            <div className="text-red-500 text-sm text-center mt-2">
              {error.message}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-[#18181B]/50">
          <p className="text-xs text-[#A1A1AA] text-center leading-relaxed">
            By connecting a wallet, you agree to EigenWatch&apos;s{" "}
            <a
              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000"}/terms`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              Terms of Service
            </a>{" "}
            and acknowledge that you have read and understood the disclaimers
            therein.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
