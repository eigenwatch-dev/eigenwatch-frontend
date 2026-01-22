import { NetworkCommissionBenchmarks } from "@/types/commission.types";

/**
 * Converts basis points to percentage.
 * @param bips - Value in basis points (e.g., 1000 = 10%)
 * @returns Percentage as a number (e.g., 10)
 */
export function bipsToPercent(bips: number): number {
  return bips / 100;
}

/**
 * Formats a commission value (in bips) as a percentage string.
 * @param bips - Value in basis points
 * @returns Formatted string (e.g., "10.00%")
 */
export function formatCommission(bips: number): string {
  return `${bipsToPercent(bips).toFixed(2)}%`;
}

export type CommissionTier = "cheap" | "fair" | "expensive";

/**
 * Determines the commission tier based on network benchmarks.
 * @param bips - The operator's commission in basis points
 * @param benchmarks - Network-wide commission statistics
 * @returns 'cheap' if below p25, 'expensive' if above p75, otherwise 'fair'
 */
export function getCommissionTier(
  bips: number,
  benchmarks?: NetworkCommissionBenchmarks,
): CommissionTier {
  if (!benchmarks) return "fair";

  if (bips < benchmarks.p25_pi_commission_bips) return "cheap";
  if (bips > benchmarks.p75_pi_commission_bips) return "expensive";
  return "fair";
}

/**
 * Returns display properties for a commission tier.
 */
export function getTierDisplay(tier: CommissionTier): {
  label: string;
  color: string;
  emoji: string;
} {
  switch (tier) {
    case "cheap":
      return { label: "Below Average", color: "text-green-500", emoji: "🟢" };
    case "expensive":
      return { label: "Above Average", color: "text-red-500", emoji: "🔴" };
    default:
      return { label: "Average", color: "text-yellow-500", emoji: "🟡" };
  }
}
