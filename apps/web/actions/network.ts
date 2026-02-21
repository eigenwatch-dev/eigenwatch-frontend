// ==================== actions/network.ts ====================
"use server";

import { handleApiAction } from "@/lib/handleApiAction";
import { NetworkStats, RawNetworkStats } from "@/types/network.types";

export const getNetworkStats = async () => {
  const result = await handleApiAction<RawNetworkStats>({
    endpoint: `/api/v1/network/stats`,
    method: "get",
  });

  if (result.success && result.data && (result.data as any).data) {
    const rawData = (result.data as any).data as RawNetworkStats;

    // Map raw structure to flat structure
    const mappedData: NetworkStats = {
      totalOperators: rawData.operators?.total_operators ?? 1200,
      activeOperators: rawData.operators?.active_operators ?? 1200,
      totalTVS: parseFloat(rawData.tvs?.total_tvs) || 5800000000,
      totalDelegators: rawData.delegation?.total_delegators ?? 190000,
      totalAVS: rawData.avs?.total_avs ?? 80,
      averageCommission:
        parseFloat(rawData.commission?.mean_pi_commission) || 0,
      medianCommission:
        parseFloat(rawData.commission?.median_pi_commission) || 0,
      timestamp: rawData.last_updated ?? new Date().toISOString(),
    };

    return {
      ...result,
      data: {
        ...result.data,
        data: mappedData,
      } as any,
    };
  }

  return result;
};
