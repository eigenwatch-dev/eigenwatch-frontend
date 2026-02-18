"use client";

import {
  getOperatorAVS,
  getOperatorAVSDetail,
  getAVSRegistrationHistory,
  getAVSRelationshipTimeline,
} from "@/actions/avs";
import { QUERY_KEYS } from "@/lib/queryKey";
import { AVSListParams } from "@/types/avs.types";
import { AVSTimelineParams } from "@/types/daily_snapshots.types";
import { useQuery } from "@tanstack/react-query";

// ==================== AVS ====================

export const useOperatorAVS = (
  id: string,
  params?: AVSListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorAVS(id, params),
    queryFn: () => getOperatorAVS(id, params),
    enabled: enabled && !!id,
    select: (data) => data.data?.data,
    staleTime: 5 * 60_000, // 5 minutes: changes rarely
  });
};

export const useOperatorAVSDetail = (
  operatorId: string,
  avsId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorAVSDetail(operatorId, avsId),
    queryFn: () => getOperatorAVSDetail(operatorId, avsId),
    enabled: enabled && !!operatorId && !!avsId,
  });
};

export const useAVSRegistrationHistory = (
  operatorId: string,
  avsId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorAVSHistory(operatorId, avsId),
    queryFn: () => getAVSRegistrationHistory(operatorId, avsId),
    enabled: enabled && !!operatorId && !!avsId,
  });
};

export const useAVSRelationshipTimeline = (
  operatorId: string,
  avsId: string,
  params: AVSTimelineParams,
  enabled = true
) => {
  return useQuery({
    queryKey: QUERY_KEYS.operatorAVSTimeline(operatorId, avsId, params),
    queryFn: () => getAVSRelationshipTimeline(operatorId, avsId, params),
    enabled:
      enabled &&
      !!operatorId &&
      !!avsId &&
      !!params.date_from &&
      !!params.date_to,
  });
};
