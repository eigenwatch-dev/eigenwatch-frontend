"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { parseUnits, formatUnits, Address } from "viem";
import { toast } from "react-toastify";
import {
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { verifyPayment } from "@/lib/auth-api";
import useAuthStore from "@/hooks/store/useAuthStore";
import { useRouter } from "next/navigation";
import { UpgradeAbandonmentFeedback } from "@/components/feedback";

// Configuration
const ADMIN_ADDRESS = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;
const PRO_PRICE = process.env.NEXT_PUBLIC_PRO_PRICE_USDC || "20"; // $20 USD equivalent

const TOKENS = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
  USDT: "0xfde4C96c8593536e31f229ea8f37b2ada2699bb2" as Address,
} as const;

type TokenType = keyof typeof TOKENS;

const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { user, openAuthModal } = useAuthStore();
  const router = useRouter();

  const [selectedToken, setSelectedToken] = useState<TokenType>("USDC");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showAbandonmentFeedback, setShowAbandonmentFeedback] = useState(false);

  const handleClose = () => {
    onClose();
    // Show abandonment feedback after a short delay
    setTimeout(() => setShowAbandonmentFeedback(true), 300);
  };

  const emailVerified =
    user?.email_verified || user?.emails?.some((e) => e.is_verified);

  const { data: usdcBalance } = useReadContract({
    address: TOKENS.USDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && isOpen,
    },
  });

  const { data: usdtBalance } = useReadContract({
    address: TOKENS.USDT,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && isOpen,
    },
  });

  const proPriceUnits = parseUnits(PRO_PRICE, 6);

  // Auto-select token based on sufficient balance
  useEffect(() => {
    if (usdcBalance !== undefined && usdtBalance !== undefined) {
      const usdc = BigInt((usdcBalance as any) || 0);
      const usdt = BigInt((usdtBalance as any) || 0);

      if (usdc < proPriceUnits && usdt >= proPriceUnits) {
        setSelectedToken("USDT");
      } else if (usdt < proPriceUnits && usdc >= proPriceUnits) {
        setSelectedToken("USDC");
      }
    }
  }, [usdcBalance, usdtBalance, proPriceUnits]);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isWaitingForTx, isSuccess: isTxConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Handle successful transaction
  useEffect(() => {
    if (isTxConfirmed && hash && !isVerifying) {
      handleVerifyPayment(hash);
    }
  }, [isTxConfirmed, hash]);

  const handleVerifyPayment = async (txHash: string) => {
    setIsVerifying(true);
    try {
      const result = await verifyPayment(txHash);
      if (result.success) {
        toast.success("Account upgraded to PRO successfully!");
        window.location.reload();
      } else {
        toast.error(result.message || "Payment verification failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const activeBalance = selectedToken === "USDC" ? usdcBalance : usdtBalance;

  const handlePayCrypto = async () => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }

    const currentBalance = BigInt((activeBalance as any) || 0);
    if (currentBalance < proPriceUnits) {
      toast.error(`Insufficient ${selectedToken} balance on Base.`);
      return;
    }

    writeContract({
      address: TOKENS[selectedToken],
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [ADMIN_ADDRESS, proPriceUnits],
    });
  };

  if (!isOpen) return (
    <UpgradeAbandonmentFeedback
      open={showAbandonmentFeedback}
      onOpenChange={setShowAbandonmentFeedback}
    />
  );

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in duration-200">
        {/* Header - Fixed */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            Upgrade to Pro
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-4 text-sm text-blue-500">
            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Unlock advanced risk metrics, detailed strategy insights, and
              priority access by upgrading to PRO.
            </p>
          </div>

          {!emailVerified && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-4 text-sm text-yellow-500">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Email verification is required to upgrade. Please verify your
                email to continue.
              </p>
            </div>
          )}

          {/* Token Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Select Asset
                <span className="ml-2 lowercase font-normal opacity-70">
                  (Base Network)
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { name: "USD Coin", symbol: "USDC", balance: usdcBalance },
                { name: "Tether", symbol: "USDT", balance: usdtBalance },
              ].map((token) => {
                const balanceVal =
                  token.balance !== undefined
                    ? BigInt(token.balance as any)
                    : undefined;
                const isInsufficient =
                  balanceVal !== undefined && balanceVal < proPriceUnits;

                return (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol as TokenType)}
                    className={`relative flex items-center justify-between p-4 rounded-lg border transition-all ${
                      selectedToken === token.symbol
                        ? "bg-secondary border-blue-500/50"
                        : "bg-background border-border hover:border-border-highlight"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2.5 rounded-md ${
                          selectedToken === token.symbol
                            ? "bg-blue-500 text-white"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{token.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {token.symbol}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-mono font-medium tabular-nums ${
                          isInsufficient ? "text-destructive" : "text-green-500"
                        }`}
                      >
                        {token.balance !== undefined
                          ? parseFloat(
                              formatUnits(BigInt(token.balance as any), 6),
                            ).toFixed(2)
                          : "0.00"}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        Balance
                      </p>
                    </div>

                    {selectedToken === token.symbol && (
                      <div className="absolute -top-1.5 -right-1.5 bg-blue-500 rounded-full p-0.5 text-white shadow-sm ring-2 ring-card">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Plan Duration</span>
              <span className="font-semibold text-foreground">30 Days</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="text-lg font-bold text-foreground font-mono">
                ${PRO_PRICE}{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  USD
                </span>
              </span>
            </div>
            <div className="bg-secondary/50 p-3 rounded text-[11px] text-muted-foreground text-center">
              Access is one-time and ends automatically after 30 days.
            </div>
          </div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="p-6 border-t border-border shrink-0">
          <div className="space-y-3">
            {!emailVerified ? (
              <button
                onClick={() => openAuthModal("email")}
                className="w-full py-3.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all text-sm"
              >
                Verify Email to Continue
              </button>
            ) : chainId !== base.id ? (
              <button
                onClick={() => switchChain({ chainId: base.id })}
                className="w-full py-3.5 rounded-md bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500/5 font-bold transition-all text-sm"
              >
                Switch to Base Network
              </button>
            ) : isPending || isWaitingForTx || isVerifying ? (
              <div className="space-y-3">
                <button
                  disabled
                  className="w-full py-3.5 rounded-md bg-secondary text-muted-foreground font-bold flex items-center justify-center gap-3 text-sm"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {isPending
                      ? "Check Wallet..."
                      : isWaitingForTx
                        ? "Confirming on Base..."
                        : "Upgrading Tier..."}
                  </span>
                </button>
                {hash && (
                  <a
                    href={`https://basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-blue-500 transition-colors uppercase tracking-widest font-mono"
                  >
                    View on Basescan <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={handlePayCrypto}
                className="w-full py-3.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all text-sm"
              >
                Pay ${PRO_PRICE} with {selectedToken}
              </button>
            )}

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex gap-3 text-xs text-destructive items-center">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="font-semibold">
                  {error.message.includes("User rejected")
                    ? "Transaction rejected."
                    : "Payment failed. Try again."}
                </p>
              </div>
            )}
          </div>

          <p className="mt-4 text-[10px] text-center text-muted-foreground/60 leading-relaxed font-mono">
            On-chain payments via Base. Upgrade is instantaneous after network
            confirmation.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
