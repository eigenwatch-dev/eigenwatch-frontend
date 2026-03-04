"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";
import useAuthStore from "@/hooks/store/useAuthStore";

export const dynamic = "force-dynamic";

function ConnectPageContent() {
  const { isAuthenticated, isRestoring, openAuthModal } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sanitize redirect URL to prevent loops
  let targetRedirect = searchParams.get("redirect") || "/operator";
  if (targetRedirect.startsWith("/connect")) {
    targetRedirect = "/operator";
  }

  const { isConnected } = useAccount();

  // Redirect to the target page if wallet is already connected
  // AuthProvider will pick up the "connected but unauthenticated" state and show the modal on the destination page
  useEffect(() => {
    if (isConnected) {
      router.replace(targetRedirect);
    }
  }, [isConnected, targetRedirect, router]);

  // Redirect to the target page once fully authenticated
  useEffect(() => {
    // Robust check: only redirect if authenticated AND we have an access token cookie
    // This prevents loops where the store is out of sync with the server
    const hasCookie = document.cookie.includes("access_token=");

    if (isAuthenticated && hasCookie) {
      router.replace(targetRedirect);
    }
  }, [isAuthenticated, targetRedirect, router]);

  // Auto-open the auth modal once restore attempt completes
  useEffect(() => {
    if (!isRestoring && !isAuthenticated && !isConnected) {
      openAuthModal("connect");
    }
  }, [isRestoring, isAuthenticated, isConnected, openAuthModal]);

  if (isRestoring) {
    return (
      <div className="h-full min-h-[60vh] flex items-center justify-center py-[45px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-full min-h-[60vh] flex items-center justify-center py-[45px]">
      <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Wallet className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Connect Your Wallet
        </h2>
        <p className="text-sm text-muted-foreground">
          Connect your wallet and sign in to access the EigenWatch dashboard.
        </p>
        <button
          onClick={() => openAuthModal("connect")}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full min-h-[60vh] flex items-center justify-center py-[45px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ConnectPageContent />
    </Suspense>
  );
}
