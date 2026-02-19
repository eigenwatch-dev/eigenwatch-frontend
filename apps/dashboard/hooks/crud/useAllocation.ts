"use client";

import {
  getAllocationsOverview,
  getDetailedAllocations,
  getAllocationHistory,
} from "@/actions/allocation";
import { QUERY_KEYS } from "@/lib/queryKey";
import { DetailedAllocationParams } from "@/types/allocation.types";
import { AllocationHistoryParams } from "@/types/daily_snapshots.types";
import { useQuery } from "@tanstack/react-query";

// ==================== ALLOCATIONS ====================

export const useAllocationsOverview = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorAllocations(id),
    queryFn: () => getAllocationsOverview(id),
    enabled: enabled && !!id,
    select: (data) => data.data?.data,
    staleTime: 2 * 60_000, // 2 minutes: can change
  });
};

export const useDetailedAllocations = (
  id: string,
  params?: DetailedAllocationParams,
  enabled = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorAllocationsDetailed(id, params),
    queryFn: () => getDetailedAllocations(id, params),
    enabled: enabled && !!id,
  });
};

export const useAllocationHistory = (
  id: string,
  params: AllocationHistoryParams,
  enabled = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorAllocationHistory(id, params),
    queryFn: () => getAllocationHistory(id, params),
    enabled: enabled && !!id && !!params.date_from && !!params.date_to,
  });
};
