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
    setPendingConnectorId(connector.uid);
    connect({ connector });
  };

  const prioritizedConnectors = ["MetaMask", "WalletConnect"];

  const filteredConnectors = connectors
    .filter((c) => prioritizedConnectors.some((p) => c.name.includes(p)))
    .sort((a, b) => {
      const indexA = prioritizedConnectors.findIndex((p) => a.name.includes(p));
      const indexB = prioritizedConnectors.findIndex((p) => b.name.includes(p));
      return indexA - indexB;
    });

  const uniqueConnectors = Array.from(
    new Map(filteredConnectors.map((c) => [c.name, c])).values(),
  );

  const getIcon = (name: string) => {
    if (name.includes("MetaMask")) return WALLET_ICONS.MetaMask;
    if (name.includes("WalletConnect")) return WALLET_ICONS.WalletConnect;
    return null;
  };

  const isMetaMaskInstalled =
    typeof window !== "undefined" && !!(window as any).ethereum?.isMetaMask;

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

      <div className="flex flex-col gap-3">
        {uniqueConnectors.length > 0 ? (
          uniqueConnectors.map((connector) => {
            const isMetaMask = connector.name.includes("MetaMask");
            const isInstalled = isMetaMask && isMetaMaskInstalled;

            return (
              <button
                key={connector.uid}
                disabled={status === "pending"}
                onClick={() => handleConnect(connector)}
                className="flex items-center justify-between w-full p-4 rounded-lg bg-[#18181B] border border-white/5 hover:border-white/10 hover:bg-[#27272A] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    {getIcon(connector.name)}
                  </div>
                  <span className="font-medium text-white">
                    {isMetaMask ? "MetaMask" : connector.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isInstalled && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A1A1AA] bg-white/5 px-1.5 py-0.5 rounded">
                      Installed
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
        By connecting a wallet, you agree to EigenWatch's Terms of Service and
        Privacy Policy.
      </p>
    </div>
  );
}
