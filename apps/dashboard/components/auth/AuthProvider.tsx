"use client";

import { useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import useAuthStore from "@/hooks/store/useAuthStore";
import { refreshToken } from "@/lib/auth-api";
import { AuthModal } from "./AuthModal";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    isAuthenticated,
    setUser,
    setAccessToken,
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
        // Wallet disconnected — clear auth
        logout();
      }
      previousAddress.current = undefined;
      hasAttemptedRefresh.current = false;
      setRestoring(false);
      return;
    }

    // Wallet address changed (switched wallets)
    if (previousAddress.current && previousAddress.current !== address) {
      logout();
      hasAttemptedRefresh.current = false;
    }

    previousAddress.current = address;

    if (isAuthenticated || hasAttemptedRefresh.current) return;

    hasAttemptedRefresh.current = true;

    // Try silent refresh
    refreshToken()
      .then((data) => {
        setAccessToken(data.access_token);
        setUser(data.user);
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
    setUser,
    setAccessToken,
    openAuthModal,
    logout,
    setRestoring,
  ]);

  return (
    <>
      {children}
      <AuthModal />
    </>
  );
}
