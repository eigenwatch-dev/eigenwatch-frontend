"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/hooks/store/useAuthStore";
import { doRefresh, logout as apiLogout } from "@/lib/auth-api";
import { AuthModal } from "./AuthModal";
import { BetaPerkModal } from "@/components/beta/BetaPerkModal";
import type { UnseenBetaPerk } from "@/types/auth.types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, openAuthModal, setRestoring } = useAuthStore();

  const hasAttemptedRefresh = useRef(false);
  const previousAddress = useRef<string | undefined>(undefined);

  // Beta perk modal state
  const [betaPerkQueue, setBetaPerkQueue] = useState<UnseenBetaPerk[]>([]);
  const [showBetaModal, setShowBetaModal] = useState(false);

  // When user data changes, check for unseen beta perks
  useEffect(() => {
    if (user?.unseen_beta_perks && user.unseen_beta_perks.length > 0) {
      setBetaPerkQueue(user.unseen_beta_perks);
      setShowBetaModal(true);
    }
  }, [user?.unseen_beta_perks]);

  const handleBetaPerkDismiss = useCallback(() => {
    setBetaPerkQueue((prev) => {
      const remaining = prev.slice(1);
      if (remaining.length === 0) {
        setShowBetaModal(false);
      }
      return remaining;
    });
  }, []);

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
        // No existing session
        if (isConnected && address) {
          // Wallet is connected but no session found -> open sign modal on the CURRENT page
          openAuthModal("sign");
        } else if (pathname !== "/connect") {
          // No wallet + no session -> redirect to connect page
          const params = new URLSearchParams();
          params.set("redirect", pathname + window.location.search);
          router.replace(`/connect?${params.toString()}`);
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

  const currentPerk = betaPerkQueue[0] ?? null;

  return (
    <>
      {children}
      <AuthModal />
      <BetaPerkModal
        perk={currentPerk}
        open={showBetaModal && currentPerk !== null}
        onDismiss={handleBetaPerkDismiss}
      />
    </>
  );
}
