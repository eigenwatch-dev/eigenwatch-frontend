import useAuthStore from "@/hooks/store/useAuthStore";
import { log } from "node:console";

export function useProAccess() {
  const { tier, isAuthenticated } = useAuthStore();

  console.log("tier", tier);
  console.log("isAuthenticated", isAuthenticated);

  return {
    isPro:
      tier.toLocaleUpperCase() === "PRO" ||
      tier.toLocaleUpperCase() === "ENTERPRISE",
    isFree:
      tier.toLocaleUpperCase() === "FREE" ||
      tier.toLocaleUpperCase() === "ANONYMOUS" ||
      !isAuthenticated,
    tier,
    isAuthenticated,
  };
}
