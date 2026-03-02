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
import { Loader2, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { verifyPayment } from "@/lib/auth-api";
import useAuthStore from "@/hooks/store/useAuthStore";

// USDC on Base
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address;
const ADMIN_ADDRESS = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;
const PRO_PRICE = "20"; // $20 USDC

const USDC_ABI = [
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
  const { setUser } = useAuthStore();

  const [isVerifying, setIsVerifying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isWaitingForTx, isSuccess: isTxConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Handle successful transaction
  useEffect(() => {
    if (isTxConfirmed && hash && !isVerifying) {
      handleVerifyPayment(hash);
    }
  }, [isTxConfirmed, hash]);

  const handleVerifyPayment = async (hash: string) => {
    setIsVerifying(true);
    try {
      const result = await verifyPayment(hash);
      if (result.success) {
        toast.success("Account upgraded to PRO successfully!");
        // Refresh user in store
        // Note: we might want to fetch user again or just update tier
        // For now, let's assume we need to refresh state
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

  const handlePay = async () => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }

    if (typeof balance !== "bigint" || balance < parseUnits(PRO_PRICE, 6)) {
      toast.error("Insufficient USDC balance on Base.");
      return;
    }

    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "transfer",
      args: [ADMIN_ADDRESS, parseUnits(PRO_PRICE, 6)],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Upgrade to Pro
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3 text-sm text-blue-400">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <p>
              Unlock advanced risk metrics, detailed strategy insights, and
              priority access by upgrading to PRO.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium text-foreground">
                {PRO_PRICE} USDC
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Network</span>
              <span className="font-medium text-foreground">Base</span>
            </div>
            {typeof balance === "bigint" && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Your Balance</span>
                <span
                  className={`font-medium ${balance < parseUnits(PRO_PRICE, 6) ? "text-red-400" : "text-foreground"}`}
                >
                  {parseFloat(formatUnits(balance, 6)).toFixed(2)} USDC
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {chainId !== base.id ? (
              <button
                onClick={() => switchChain({ chainId: base.id })}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                Switch to Base Network
              </button>
            ) : isPending || isWaitingForTx || isVerifying ? (
              <div className="space-y-3">
                <button
                  disabled
                  className="w-full py-3 rounded-lg bg-primary/50 text-primary-foreground font-semibold flex items-center justify-center gap-2"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isPending
                    ? "Confirming in Wallet..."
                    : isWaitingForTx
                      ? "Waiting for Transaction..."
                      : "Verifying Payment..."}
                </button>
                {hash && (
                  <a
                    href={`https://basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    View on Basescan <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={handlePay}
                className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-lg shadow-primary/20"
              >
                Pay {PRO_PRICE} USDC
              </button>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>
                  {error.message.includes("User rejected")
                    ? "Transaction rejected."
                    : "Transaction failed."}
                </p>
              </div>
            )}
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            Payments are processed on-chain. Once the transaction is confirmed,
            your account will be upgraded automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
