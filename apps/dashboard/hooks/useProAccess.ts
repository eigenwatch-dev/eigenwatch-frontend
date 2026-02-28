import useAuthStore from "@/hooks/store/useAuthStore";

export function useProAccess() {
  const { tier, isAuthenticated } = useAuthStore();

  return {
    isPro: tier === "PRO" || tier === "ENTERPRISE",
    isFree: tier === "FREE" || !isAuthenticated,
    tier,
    isAuthenticated,
  };
}
