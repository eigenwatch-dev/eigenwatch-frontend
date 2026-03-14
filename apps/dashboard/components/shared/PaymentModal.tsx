/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  ArrowLeftRight,
  Copy,
  Clock,
  ChevronLeft,
} from "lucide-react";
import {
  verifyPayment,
  getChainrailsQuotes,
  createChainrailsIntent,
  getMe,
  type ChainrailsQuote,
  type ChainrailsIntent,
} from "@/lib/auth-api";
import useAuthStore from "@/hooks/store/useAuthStore";
import { UpgradeAbandonmentFeedback } from "@/components/feedback";
import { getChainInfo, formatTokenAmount } from "@/lib/chain-utils";

// Configuration
const ADMIN_ADDRESS = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;
const PRO_PRICE = process.env.NEXT_PUBLIC_PRO_PRICE_USDC || "20";

// Base USDC is the default destination token for Chainrails
const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const TOKENS = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
  USDT: "0xfde4C96c8593536e31f229ea8f37b2ada2699bb2" as Address,
} as const;

type TokenType = keyof typeof TOKENS;
type PaymentMethod = "base" | "crosschain";
type CrossChainStep = "quotes" | "deposit" | "waiting";

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
  const { user, openAuthModal, setUser } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("base");
  const [selectedToken, setSelectedToken] = useState<TokenType>("USDC");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showAbandonmentFeedback, setShowAbandonmentFeedback] = useState(false);

  // Cross-chain state
  const [crossChainStep, setCrossChainStep] =
    useState<CrossChainStep>("quotes");
  const [quotes, setQuotes] = useState<ChainrailsQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<ChainrailsQuote | null>(
    null,
  );
  const [intent, setIntent] = useState<ChainrailsIntent | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = () => {
    stopPolling();
    onClose();
    setTimeout(() => setShowAbandonmentFeedback(true), 300);
  };

  // Reset cross-chain state when switching methods or closing
  useEffect(() => {
    if (!isOpen) {
      setCrossChainStep("quotes");
      setQuotes([]);
      setSelectedQuote(null);
      setIntent(null);
      setQuotesError(null);
      stopPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const emailVerified =
    user?.email_verified || user?.emails?.some((e) => e.is_verified);

  // --- Base direct payment logic ---

  const { data: usdcBalance } = useReadContract({
    address: TOKENS.USDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: !!address && isOpen },
  });

  const { data: usdtBalance } = useReadContract({
    address: TOKENS.USDT,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: !!address && isOpen },
  });

  const proPriceUnits = parseUnits(PRO_PRICE, 6);

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

  useEffect(() => {
    if (isTxConfirmed && hash && !isVerifying) {
      handleVerifyPayment(hash);
    }
  }, [isTxConfirmed, hash, isVerifying]);

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

  // --- Cross-chain (Chainrails) logic ---

  const fetchQuotes = useCallback(async () => {
    setIsLoadingQuotes(true);
    setQuotesError(null);
    try {
      const data = await getChainrailsQuotes(
        PRO_PRICE,
        "BASE_MAINNET",
        BASE_USDC_ADDRESS,
      );
      // data might be an array or an object with quotes
      const quotesArray = Array.isArray(data) ? data : [];
      setQuotes(quotesArray);
      if (quotesArray.length === 0) {
        setQuotesError("No cross-chain routes available at the moment.");
      }
    } catch (err: any) {
      setQuotesError(err.message || "Failed to fetch quotes.");
    } finally {
      setIsLoadingQuotes(false);
    }
  }, []);

  useEffect(() => {
    if (paymentMethod === "crosschain" && isOpen && emailVerified) {
      fetchQuotes();
    }
  }, [paymentMethod, isOpen, emailVerified, fetchQuotes]);

  const handleSelectQuote = async (quote: ChainrailsQuote) => {
    if (!address) return;
    setSelectedQuote(quote);
    setIsCreatingIntent(true);
    try {
      const intentData = await createChainrailsIntent({
        sender: address,
        amount: PRO_PRICE,
        amountSymbol: "USDC",
        tokenIn: quote.tokenIn,
        sourceChain: quote.source_chain,
        destinationChain: "BASE_MAINNET",
        recipient: ADMIN_ADDRESS,
        refundAddress: address,
        metadata: { purpose: "pro_upgrade" },
      });
      setIntent(intentData);
      setCrossChainStep("deposit");
    } catch (err: any) {
      toast.error(err.message || "Failed to create payment intent.");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    setCrossChainStep("waiting");
    pollingRef.current = setInterval(async () => {
      try {
        const userData = await getMe();
        if (userData.tier === "PRO") {
          stopPolling();
          setUser(userData);
          toast.success("Account upgraded to PRO successfully!");
          window.location.reload();
        }
      } catch {
        // Ignore polling errors
      }
    }, 10000);
  }, [stopPolling, setUser]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (!isOpen)
    return (
      <UpgradeAbandonmentFeedback
        open={showAbandonmentFeedback}
        onOpenChange={setShowAbandonmentFeedback}
      />
    );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-background/90 animate-in fade-in duration-200">
        <div className="bg-card border border-border rounded-t-xl sm:rounded-xl w-full sm:max-w-md shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-4 sm:zoom-in duration-200">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {paymentMethod === "crosschain" &&
                crossChainStep !== "quotes" && (
                  <button
                    onClick={() => {
                      stopPolling();
                      setCrossChainStep("quotes");
                      setIntent(null);
                      setSelectedQuote(null);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
              <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
                Upgrade to Pro
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <div className="p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3 text-sm text-blue-500">
              <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-xs sm:text-sm">
                Unlock advanced risk metrics, detailed strategy insights, and
                priority access by upgrading to PRO.
              </p>
            </div>

            {!emailVerified && (
              <div className="p-3 sm:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3 text-sm text-yellow-500">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-xs sm:text-sm">
                  Email verification is required to upgrade. Please verify your
                  email to continue.
                </p>
              </div>
            )}

            {/* Payment Method Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setPaymentMethod("base")}
                className={`flex-1 py-2.5 px-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === "base"
                    ? "bg-blue-500 text-white"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wallet className="h-3.5 w-3.5" />
                Pay on Base
              </button>
              <button
                onClick={() => setPaymentMethod("crosschain")}
                className={`flex-1 py-2.5 px-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === "crosschain"
                    ? "bg-blue-500 text-white"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Cross-Chain
              </button>
            </div>

            {/* Payment Method Content */}
            {paymentMethod === "base" ? (
              <BasePaymentContent
                selectedToken={selectedToken}
                setSelectedToken={setSelectedToken}
                usdcBalance={usdcBalance}
                usdtBalance={usdtBalance}
                proPriceUnits={proPriceUnits}
              />
            ) : (
              <CrossChainContent
                step={crossChainStep}
                quotes={quotes}
                isLoadingQuotes={isLoadingQuotes}
                quotesError={quotesError}
                selectedQuote={selectedQuote}
                intent={intent}
                isCreatingIntent={isCreatingIntent}
                onSelectQuote={handleSelectQuote}
                onRetryQuotes={fetchQuotes}
                onCopy={copyToClipboard}
                onStartPolling={startPolling}
              />
            )}

            {/* Pricing info */}
            <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-border">
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

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-border shrink-0">
            <div className="space-y-3">
              {!emailVerified ? (
                <button
                  onClick={() => openAuthModal("email")}
                  className="w-full py-3.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all text-sm"
                >
                  Verify Email to Continue
                </button>
              ) : paymentMethod === "base" ? (
                <BasePaymentFooter
                  chainId={chainId}
                  switchChain={switchChain}
                  isPending={isPending}
                  isWaitingForTx={isWaitingForTx}
                  isVerifying={isVerifying}
                  hash={hash}
                  error={error}
                  selectedToken={selectedToken}
                  onPay={handlePayCrypto}
                />
              ) : (
                <CrossChainFooter
                  step={crossChainStep}
                  intent={intent}
                  onStartPolling={startPolling}
                />
              )}
            </div>

            <p className="mt-4 text-[10px] text-center text-muted-foreground/60 leading-relaxed font-mono">
              {paymentMethod === "base"
                ? "On-chain payments via Base. Upgrade is instantaneous after network confirmation."
                : "Cross-chain payments powered by Chainrails. Funds are bridged automatically."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Sub-components ---

function BasePaymentContent({
  selectedToken,
  setSelectedToken,
  usdcBalance,
  usdtBalance,
  proPriceUnits,
}: {
  selectedToken: TokenType;
  setSelectedToken: (t: TokenType) => void;
  usdcBalance: any;
  usdtBalance: any;
  proPriceUnits: bigint;
}) {
  return (
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
          {
            name: "USD Coin",
            symbol: "USDC" as TokenType,
            balance: usdcBalance,
          },
          { name: "Tether", symbol: "USDT" as TokenType, balance: usdtBalance },
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
              onClick={() => setSelectedToken(token.symbol)}
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
  );
}

function BasePaymentFooter({
  chainId,
  switchChain,
  isPending,
  isWaitingForTx,
  isVerifying,
  hash,
  error,
  selectedToken,
  onPay,
}: {
  chainId: number | undefined;
  switchChain: (args: { chainId: number }) => void;
  isPending: boolean;
  isWaitingForTx: boolean;
  isVerifying: boolean;
  hash: `0x${string}` | undefined;
  error: Error | null;
  selectedToken: TokenType;
  onPay: () => void;
}) {
  const PRO_PRICE_DISPLAY = process.env.NEXT_PUBLIC_PRO_PRICE_USDC || "20";

  return (
    <>
      {chainId !== base.id ? (
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
          onClick={onPay}
          className="w-full py-3.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all text-sm"
        >
          Pay ${PRO_PRICE_DISPLAY} with {selectedToken}
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
    </>
  );
}

function CrossChainContent({
  step,
  quotes,
  isLoadingQuotes,
  quotesError,
  selectedQuote,
  intent,
  isCreatingIntent,
  onSelectQuote,
  onRetryQuotes,
  onCopy,
  // onStartPolling,
}: {
  step: CrossChainStep;
  quotes: ChainrailsQuote[];
  isLoadingQuotes: boolean;
  quotesError: string | null;
  selectedQuote: ChainrailsQuote | null;
  intent: ChainrailsIntent | null;
  isCreatingIntent: boolean;
  onSelectQuote: (q: ChainrailsQuote) => void;
  onRetryQuotes: () => void;
  onCopy: (text: string) => void;
  onStartPolling: () => void;
}) {
  if (step === "quotes") {
    return (
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Select Source Chain
        </label>

        {isLoadingQuotes && (
          <div className="flex items-center justify-center py-8 gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Fetching available routes...</span>
          </div>
        )}

        {quotesError && !isLoadingQuotes && (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-muted-foreground">{quotesError}</p>
            <button
              onClick={onRetryQuotes}
              className="text-xs text-blue-500 hover:text-blue-400 font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoadingQuotes && !quotesError && quotes.length > 0 && (
          <div className="grid grid-cols-1 gap-2.5">
            {quotes.map((quote, i) => {
              const chain = getChainInfo(quote.source_chain);
              return (
                <button
                  key={`${quote.source_chain}-${quote.tokenIn}-${i}`}
                  onClick={() => onSelectQuote(quote)}
                  disabled={isCreatingIntent}
                  className="relative flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:border-blue-500/50 hover:bg-secondary transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-md ${chain.bgColor}`}>
                      <ArrowLeftRight
                        className="h-4 w-4"
                        style={{ color: chain.color }}
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">{chain.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {quote.asset_token_symbol}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-mono font-medium tabular-nums text-foreground">
                      {formatTokenAmount(
                        quote.total_amount_in_asset_token,
                        quote.asset_token_decimals,
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                      Total
                    </p>
                  </div>

                  {isCreatingIntent && selectedQuote === quote && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (step === "deposit" && intent) {
    const expiresAt = new Date(intent.expires_at);
    return (
      <div className="space-y-4">
        <div className="p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex gap-3 text-sm text-green-500">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-xs sm:text-sm">
            Payment intent created. Send the exact amount below to complete your
            upgrade.
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-secondary border border-border space-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                Send To
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-foreground break-all flex-1">
                  {intent.intent_address}
                </p>
                <button
                  onClick={() => onCopy(intent.intent_address)}
                  className="p-1.5 text-muted-foreground hover:text-blue-500 transition-colors shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                  Amount
                </p>
                <p className="text-sm font-mono font-semibold text-foreground">
                  {formatTokenAmount(
                    intent.total_amount_in_asset_token,
                    intent.asset_token_decimals,
                  )}{" "}
                  {intent.asset_token_symbol}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                  Chain
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {getChainInfo(intent.source_chain).name}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Expires:{" "}
                  {expiresAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "waiting") {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Waiting for confirmation...
          </p>
          <p className="text-xs text-muted-foreground">
            Your payment is being processed. This may take a few minutes for
            cross-chain transfers.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function CrossChainFooter({
  step,
  intent,
  onStartPolling,
}: {
  step: CrossChainStep;
  intent: ChainrailsIntent | null;
  onStartPolling: () => void;
}) {
  if (step === "quotes") {
    return (
      <p className="text-xs text-center text-muted-foreground">
        Select a source chain above to create a payment intent
      </p>
    );
  }

  if (step === "deposit" && intent) {
    return (
      <button
        onClick={onStartPolling}
        className="w-full py-3.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all text-sm"
      >
        I&apos;ve Sent the Payment
      </button>
    );
  }

  if (step === "waiting") {
    return (
      <button
        disabled
        className="w-full py-3.5 rounded-md bg-secondary text-muted-foreground font-bold flex items-center justify-center gap-3 text-sm"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Processing...
      </button>
    );
  }

  return null;
}
