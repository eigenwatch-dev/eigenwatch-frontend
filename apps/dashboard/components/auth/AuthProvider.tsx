"use client";

import { useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import useAuthStore from "@/hooks/store/useAuthStore";
import { doRefresh, logout as apiLogout } from "@/lib/auth-api";
import { AuthModal } from "./AuthModal";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    isAuthenticated,
    openAuthModal,
    logout,
    showAuthModal,
    setRestoring,
  } = useAuthStore();

  const hasAttemptedRefresh = useRef(false);
  const previousAddress = useRef<string | undefined>(undefined);

  // Attempt silent auth on mount or when wallet connects
  useEffect(() => {
    if (!isConnected || !address) {
      if (previousAddress.current && isAuthenticated) {
        // Wallet disconnected — clear auth (backend + frontend)
        apiLogout();
      }
      previousAddress.current = undefined;
      hasAttemptedRefresh.current = false;
      setRestoring(false);
      return;
    }

    // Wallet address changed (switched wallets)
    if (previousAddress.current && previousAddress.current !== address) {
      // Must revoke the old session cookie before proceeding
      // We use apiLogout which clears cookie AND store
      apiLogout().then(() => {
        hasAttemptedRefresh.current = false;
      });
    }

    previousAddress.current = address;

    if (isAuthenticated || hasAttemptedRefresh.current) return;

    // Wait for logout to complete if it was triggered?
    // user.id check vs address check might be safer.
    // But basic flow:

    hasAttemptedRefresh.current = true;

    // Try silent refresh — uses centralized doRefresh which deduplicates
    // concurrent calls and updates the store automatically
    doRefresh()
      .then(() => {
        // doRefresh already called setAccessToken and setUser
      })
      .catch(() => {
        // No existing session — prompt SIWE sign-in
        openAuthModal();
      })
      .finally(() => {
        setRestoring(false);
      });
  }, [
    isConnected,
    address,
    isAuthenticated,
    openAuthModal,
    // logout, // Removed from dependency to avoid loop if reference changes (it's imported)
    setRestoring,
  ]);

  return (
    <>
      {children}
      <AuthModal />
    </>
  );
}
