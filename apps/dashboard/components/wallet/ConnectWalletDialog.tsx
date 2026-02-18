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

  const handleConnect = (connectorId: string, connector: any) => {
    setPendingConnectorId(connectorId);
    connect({ connector });
  };

  // Prioritized wallets
  const prioritizedConnectors = ["MetaMask", "WalletConnect"];

  // Filter and sort connectors based on name
  const filteredConnectors = connectors
    .filter((c) => prioritizedConnectors.some((p) => c.name.includes(p)))
    .sort((a, b) => {
      const indexA = prioritizedConnectors.findIndex((p) => a.name.includes(p));
      const indexB = prioritizedConnectors.findIndex((p) => b.name.includes(p));
      return indexA - indexB;
    });

  // Deduplicate by name
  const uniqueConnectors = Array.from(
    new Map(filteredConnectors.map((c) => [c.name, c])).values(),
  );

  const getIcon = (name: string) => {
    if (name.includes("MetaMask")) return WALLET_ICONS.MetaMask;
    if (name.includes("WalletConnect")) return WALLET_ICONS.WalletConnect;
    return null;
  };

  // Improved check for MetaMask installed
  const isMetaMaskInstalled =
    typeof window !== "undefined" && !!(window as any).ethereum?.isMetaMask;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[400px] bg-[#09090B] border border-white/10 p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-white text-center">
            Connect your wallet
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2 flex flex-col gap-3">
          {uniqueConnectors.length > 0 ? (
            uniqueConnectors.map((connector) => {
              const isMetaMask = connector.name.includes("MetaMask");
              const isInstalled = isMetaMask && isMetaMaskInstalled;

              return (
                <button
                  key={connector.uid}
                  disabled={status === "pending"}
                  onClick={() => handleConnect(connector.uid, connector)}
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
            By connecting a wallet, you agree to EigenWatch's{" "}
            <a href="#" className="underline hover:text-white">
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
