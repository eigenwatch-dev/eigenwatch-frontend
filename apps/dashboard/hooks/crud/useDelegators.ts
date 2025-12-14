"use client";

import {
  getOperatorDelegators,
  getDelegatorDetail,
  getDelegationHistory,
  getDelegatorSharesHistory,
} from "@/actions/delegator";
import { QUERY_KEYS } from "@/lib/queryKey";
import { DelegatorSharesHistoryParams } from "@/types/daily_snapshots.types";
import {
  DelegatorListParams,
  DelegationHistoryParams,
} from "@/types/delegator.types";
import { useQuery } from "@tanstack/react-query";

// ==================== DELEGATORS ====================

export const useOperatorDelegators = (
  id: string,
  params?: DelegatorListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorDelegators(id, params),
    queryFn: () => getOperatorDelegators(id, params),
    enabled: enabled && !!id,
    select: (data) => data.data?.data,
  });
};

export const useDelegatorDetail = (
  operatorId: string,
  stakerId: string,
  enabled = true 
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorDelegator(operatorId, stakerId),
    queryFn: () => getDelegatorDetail(operatorId, stakerId),
    enabled: enabled && !!operatorId && !!stakerId,
  });
};

export const useDelegationHistory = (
  id: string,
  params?: DelegationHistoryParams,
  enabled = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorDelegationHistory(id, params),
    queryFn: () => getDelegationHistory(id, params),
    enabled: enabled && !!id,
  });
};

export const useDelegatorSharesHistory = (
  operatorId: string,
  stakerId: string,
  params?: DelegatorSharesHistoryParams,
  enabled = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorDelegatorShares(operatorId, stakerId, params),
    queryFn: () => getDelegatorSharesHistory(operatorId, stakerId, params),
    enabled: enabled && !!operatorId && !!stakerId,
  });
};
