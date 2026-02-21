"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Wallet, Shield, Lock, Globe, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const wallets = [
  {
    name: "MetaMask",
    icon: "/images/metamask.png", // Placeholder, ideally use actual assets
    description: "Connect using MetaMask browser extension",
    isPopular: true,
  },
  {
    name: "WalletConnect",
    icon: "/images/walletconnect.png",
    description: "Scan with WalletConnect to connect",
    isPopular: true,
  },
  {
    name: "Coinbase Wallet",
    icon: "/images/coinbase.png",
    description: "Connect with Coinbase Wallet app",
  },
  {
    name: "Rainbow",
    icon: "/images/rainbow.png",
    description: "Connect using Rainbow wallet",
  },
  {
    name: "Trust Wallet",
    icon: "/images/trust.png",
    description: "Connect with Trust Wallet app",
  },
  {
    name: "Ledger",
    icon: "/images/ledger.png",
    description: "Connect your Ledger hardware wallet",
  },
];

function ConnectWalletContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const from = searchParams.get("from");
  const action = searchParams.get("action");

  // Log params for debugging/verification
  console.log("Connect Wallet Params:", { redirectTo, from, action });

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full flex flex-col items-center">
        {/* Header Icon */}
        <div className="w-16 h-16 bg-[#155DFC] rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_-10px_rgba(21,93,252,0.5)]">
          <Wallet className="text-white w-8 h-8" />
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl font-medium mb-3 text-center">
          Connect Your Wallet
        </h1>
        <p className="text-[#A1A1AA] text-center mb-10 max-w-md">
          Connect your wallet to access EigenWatch and monitor your EigenLayer
          operator portfolio
        </p>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-[#A1A1AA]">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-[#00C950]" />
            <span>Secure connection</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#155DFC]" />
            <span>Non-custodial</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[#A855F7]" />
            <span>Multi-chain support</span>
          </div>
        </div>

        {/* Wallet List */}
        <div className="w-full space-y-3 mb-12">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              className="w-full bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] rounded-xl p-4 flex items-center justify-between transition-all group"
              onClick={() => {
                console.log(`Connecting to ${wallet.name}...`);
                if (redirectTo) {
                  console.log(`Redirecting to ${redirectTo}`);
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center">
                  {/* Fallback to icon if image fails or for now */}
                  <Wallet size={20} className="text-[#A1A1AA]" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{wallet.name}</span>
                    {wallet.isPopular && (
                      <span className="text-[10px] bg-[#155DFC]/20 text-[#60A5FA] px-1.5 py-0.5 rounded font-medium">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#71717A]">
                    {wallet.description}
                  </div>
                </div>
              </div>
              <ArrowRight
                size={18}
                className="text-[#52525B] group-hover:text-white transition-colors"
              />
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="w-full bg-[#155DFC]/5 border border-[#155DFC]/20 rounded-xl p-6 mb-12">
          <div className="flex gap-4">
            <Info className="text-[#155DFC] shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium mb-1">New to Ethereum wallets?</h3>
              <p className="text-sm text-[#A1A1AA] mb-3">
                Learn more about wallets and how to set one up safely before
                connecting to EigenWatch.
              </p>
              <Link
                href="#"
                className="text-[#155DFC] text-sm font-medium flex items-center gap-1 hover:underline"
              >
                Learn about wallets <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-[#52525B] flex gap-1">
          <span>By connecting your wallet, you agree to our</span>
          <Link
            href="/terms"
            className="text-[#71717A] hover:text-white transition-colors underline"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConnectWalletPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <ConnectWalletContent />
    </Suspense>
  );
}
