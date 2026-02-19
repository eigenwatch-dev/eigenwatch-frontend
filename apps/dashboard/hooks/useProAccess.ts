import useAuthStore from "@/hooks/store/useAuthStore";
import { log } from "node:console";

export function useProAccess() {
  const { tier, isAuthenticated } = useAuthStore();

  console.log("tier", tier);
  console.log("isAuthenticated", isAuthenticated);

  return {
    isPro:
      tier.toLocaleLowerCase() === "pro" ||
      tier.toLocaleLowerCase() === "enterprise",
    isFree:
      tier.toLocaleLowerCase() === "free" ||
      tier.toLocaleLowerCase() === "anonymous" ||
      !isAuthenticated,
    tier,
    isAuthenticated,
  };
}
