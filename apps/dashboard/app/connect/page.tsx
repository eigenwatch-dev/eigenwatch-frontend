"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import useAuthStore from "@/hooks/store/useAuthStore";

export default function ConnectPage() {
  const { isAuthenticated, isRestoring, openAuthModal } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const redirect = searchParams.get("redirect") || "/operator";

  // Redirect to the target page once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  // Auto-open the auth modal once restore attempt completes
  useEffect(() => {
    if (!isRestoring && !isAuthenticated) {
      openAuthModal("connect");
    }
  }, [isRestoring, isAuthenticated, openAuthModal]);

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
