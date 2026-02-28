"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/hooks/store/useAuthStore";
import { doRefresh, logout as apiLogout } from "@/lib/auth-api";
import { AuthModal } from "./AuthModal";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    openAuthModal,
    setRestoring,
  } = useAuthStore();

  const hasAttemptedRefresh = useRef(false);
  const previousAddress = useRef<string | undefined>(undefined);

  // Attempt silent auth on mount or when wallet connects
  useEffect(() => {
    if (!isConnected || !address) {
      if (previousAddress.current && isAuthenticated) {
        // Wallet disconnected — clear auth and redirect to connect
        apiLogout().then(() => {
          if (pathname !== "/connect") {
            router.replace("/connect");
          }
        });
      }
      previousAddress.current = undefined;
      hasAttemptedRefresh.current = false;
      setRestoring(false);
      return;
    }

    // Wallet address changed (switched wallets)
    if (previousAddress.current && previousAddress.current !== address) {
      apiLogout().then(() => {
        hasAttemptedRefresh.current = false;
      });
    }

    previousAddress.current = address;

    if (isAuthenticated || hasAttemptedRefresh.current) return;

    hasAttemptedRefresh.current = true;

    // Try silent refresh — uses centralized doRefresh which deduplicates
    // concurrent calls and updates the store automatically
    doRefresh()
      .then(() => {
        // doRefresh already called setAccessToken and setUser
      })
      .catch(() => {
        // No existing session — redirect to connect page
        if (pathname !== "/connect") {
          router.replace("/connect");
        } else {
          openAuthModal("connect");
        }
      })
      .finally(() => {
        setRestoring(false);
      });
  }, [
    isConnected,
    address,
    isAuthenticated,
    openAuthModal,
    setRestoring,
    router,
    pathname,
  ]);

  return (
    <>
      {children}
      <AuthModal />
    </>
  );
}
