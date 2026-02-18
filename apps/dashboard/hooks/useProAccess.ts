import useAuthStore from "@/hooks/store/useAuthStore";

export function useProAccess() {
  const { tier, isAuthenticated } = useAuthStore();

  return {
    isPro: tier === "pro" || tier === "enterprise",
    isFree: tier === "free" || tier === "anonymous" || !isAuthenticated,
    tier,
    isAuthenticated,
  };
}
