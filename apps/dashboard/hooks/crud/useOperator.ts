"use client";

import {
  getOperators,
  getOperator,
  getOperatorStats,
  getOperatorActivity,
  getDailySnapshots,
  getSlashingIncidents,
  compareOperators,
  getOperatorRankings,
  compareOperatorToNetwork,
  getOperatorStrategies,
} from "@/actions/operators";
import { QUERY_KEYS } from "@/lib/queryKey";
import { DailySnapshotsParams } from "@/types/daily_snapshots.types";
import {
  OperatorListParams,
  OperatorDetail,
  OperatorStats,
  ActivityParams,
  CompareOperatorsRequest,
  ListOperatorStrategiesParams,
} from "@/types/operator.types";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";

// ==================== OPERATORS ====================

export const useOperators = (params?: OperatorListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.operators(params),
    queryFn: () => getOperators(params),
    select: (data) => data.data,
    staleTime: 2 * 60_000, // 2 minutes
  });
};

export const useOperator = (
  id: string,
  options?: { enabled?: boolean; initialData?: OperatorDetail },
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operator(id),
    queryFn: () => getOperator(id),
    enabled: (options?.enabled ?? true) && !!id,
    select: (data) => data.data?.data,
    initialData: options?.initialData
      ? {
          success: true,
          data: {
            success: true,
            message: "",
            data: options.initialData,
            meta: { request_id: "", timestamp: "", execution_time_ms: 0 },
          },
          error: null,
          errorCode: undefined,
        }
      : undefined,
  });
};

export const useOperatorStats = (
  id: string,
  options?: { enabled?: boolean; initialData?: OperatorStats },
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorStats(id),
    queryFn: () => getOperatorStats(id),
    enabled: (options?.enabled ?? true) && !!id,
    select: (data) => data.data?.data,
    initialData: options?.initialData
      ? {
          success: true,
          data: {
            success: true,
            message: "",
            data: options.initialData,
            meta: { request_id: "", timestamp: "", execution_time_ms: 0 },
          },
          error: null,
          errorCode: undefined,
        }
      : undefined,
  });
};

export const useOperatorActivity = (
  id: string,
  params?: ActivityParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorActivity(id, params),
    queryFn: () => getOperatorActivity(id, params),
    enabled: enabled && !!id,
    staleTime: 2 * 60_000, // 2 minutes
  });
};

export const useOperatorStrategies = (
  id: string,
  params?: ListOperatorStrategiesParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorStrategies(id, params),
    queryFn: () => getOperatorStrategies(id, params),
    enabled: enabled && !!id,
    select: (data) => data.data?.data,
    placeholderData: keepPreviousData,
  });
};

// ==================== SNAPSHOTS ====================

export const useDailySnapshots = (
  id: string,
  params: DailySnapshotsParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorSnapshots(id, params),
    queryFn: () => getDailySnapshots(id, params),
    enabled: enabled && !!id && !!params.date_from && !!params.date_to,
    select: (data) => data.data?.data,
    staleTime: 5 * 60_000, // 5 minutes: historical data, very stable
  });
};

// ==================== SLASHING ====================

export const useSlashingIncidents = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorSlashing(id),
    queryFn: () => getSlashingIncidents(id),
    enabled: enabled && !!id,
  });
};

// ==================== COMPARISON ====================

export const useCompareOperators = () => {
  return useMutation({
    mutationFn: (body: CompareOperatorsRequest) => compareOperators(body),
  });
};

export const useOperatorRankings = (
  id: string,
  date?: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorRankings(id, date),
    queryFn: () => getOperatorRankings(id, date),
    enabled: enabled && !!id,
  });
};

export const useCompareOperatorToNetwork = (
  id: string,
  date?: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorVsNetwork(id, date),
    queryFn: () => compareOperatorToNetwork(id, date),
    enabled: enabled && !!id,
  });
};
