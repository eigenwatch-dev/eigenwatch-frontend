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
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  verifyPayment,
  initializePaystack,
  verifyPaystack,
} from "@/lib/auth-api";
import useAuthStore from "@/hooks/store/useAuthStore";
import { useSearchParams, useRouter } from "next/navigation";

// USDC on Base
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address;
const ADMIN_ADDRESS = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;
const PRO_PRICE = process.env.NEXT_PUBLIC_PRO_PRICE_USDC || "20"; // $20 USDC

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
  const { user, openAuthModal } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [method, setMethod] = useState<"crypto" | "card">("crypto");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isInitializingPaystack, setIsInitializingPaystack] = useState(false);

  const emailVerified =
    user?.email_verified || user?.emails?.some((e) => e.is_verified);

  // Check for Paystack callback
  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");
    if ((reference || trxref) && isOpen && !isVerifying) {
      handleVerifyPaystack(reference || trxref || "");
    }
  }, [searchParams, isOpen]);

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && method === "crypto",
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

  const handleVerifyPaystack = async (ref: string) => {
    setIsVerifying(true);
    try {
      const result = await verifyPaystack(ref);
      if (result.success) {
        toast.success("Account upgraded to PRO successfully!");
        // Remove params from URL
        const newUrl = window.location.pathname;
        router.replace(newUrl);
        window.location.reload();
      } else {
        toast.error(result.message || "Paystack verification failed.");
      }
    } catch (err: any) {
      toast.error(
        err.message || "An error occurred during Paystack verification.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePayCrypto = async () => {
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

  const handlePayCard = async () => {
    if (!user?.emails?.[0]?.email) {
      toast.error("Please add an email to your profile first.");
      return;
    }

    setIsInitializingPaystack(true);
    try {
      const { authorization_url } = await initializePaystack(
        user.emails[0].email,
      );
      window.location.href = authorization_url;
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize Paystack.");
    } finally {
      setIsInitializingPaystack(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80">
      <div className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
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

          {!emailVerified && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3 text-sm text-yellow-500">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>
                Email verification is required to upgrade to PRO. Please verify
                your email to continue.
              </p>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              onClick={() => setMethod("crypto")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                method === "crypto"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet className="h-4 w-4" />
              Crypto
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                method === "card"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Card / Bank
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium text-foreground">PRO (1 Month)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium text-foreground">
                ${PRO_PRICE} USD
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium text-blue-400/80">
              <span className="text-xs">Access ends after 30 days</span>
            </div>
            {method === "crypto" ? (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium text-foreground">Base</span>
                </div>
                {typeof balance === "bigint" && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Your Balance</span>
                    <span
                      className={`font-medium tabular-nums ${balance < parseUnits(PRO_PRICE, 6) ? "text-red-400" : "text-foreground"}`}
                    >
                      {parseFloat(formatUnits(balance, 6)).toFixed(2)} USDC
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium text-foreground">Paystack</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!emailVerified ? (
              <button
                onClick={() => openAuthModal("email")}
                className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                Verify Email to Continue
              </button>
            ) : method === "crypto" ? (
              chainId !== base.id ? (
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
                  onClick={handlePayCrypto}
                  className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-lg shadow-primary/20"
                >
                  Pay {PRO_PRICE} USDC
                </button>
              )
            ) : isInitializingPaystack || isVerifying ? (
              <button
                disabled
                className="w-full py-3 rounded-lg bg-primary/50 text-primary-foreground font-semibold flex items-center justify-center gap-2"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                {isInitializingPaystack
                  ? "Initializing..."
                  : "Verifying Payment..."}
              </button>
            ) : (
              <button
                onClick={handlePayCard}
                className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-lg shadow-primary/20"
              >
                Continue to Checkout
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
