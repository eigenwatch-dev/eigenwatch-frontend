"use client";

import {
  getOperatorCommission,
  getCommissionHistory,
} from "@/actions/commissions";
import { QUERY_KEYS } from "@/lib/queryKey";
import { CommissionHistoryParams } from "@/types/commission.types";
import { useQuery } from "@tanstack/react-query";

// ==================== COMMISSION ====================

export const useOperatorCommission = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorCommission(id),
    queryFn: () => getOperatorCommission(id),
    enabled: enabled && !!id,
    select: (data) => data.data?.data,
    staleTime: 5 * 60_000, // 5 minutes: changes rarely
  });
};

export const useCommissionHistory = (
  id: string,
  params?: CommissionHistoryParams,
  enabled = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorCommissionHistory(id, params),
    queryFn: () => getCommissionHistory(id, params),
    enabled: enabled && !!id,
  });
};
