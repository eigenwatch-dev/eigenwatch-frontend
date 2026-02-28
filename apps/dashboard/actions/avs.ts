/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { handleApiAction } from "@/lib/handleApiAction";
import {
  AVSListParams,
  AVS,
  AVSDetail,
  AVSRegistrationHistory,
} from "@/types/avs.types";
import { AVSTimelineParams, AVSTimeline } from "@/types/daily_snapshots.types";

// ==================== AVS ====================

export const getOperatorAVS = async (id: string, params?: AVSListParams) => {
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";
  return handleApiAction<{ avs_relationships: AVS[]; pagination?: { total: number; limit: number; offset: number; has_more: boolean } }>({
    endpoint: `/api/v1/operators/${id}/avs${queryString}`,
    method: "get",
  });
};

export const getOperatorAVSDetail = async (operatorId: string, avsId: string) =>
  handleApiAction<AVSDetail>({
    endpoint: `/api/v1/operators/${operatorId}/avs/${avsId}`,
    method: "get",
  });

export const getAVSRegistrationHistory = async (
  operatorId: string,
  avsId: string
) =>
  handleApiAction<AVSRegistrationHistory>({
    endpoint: `/api/v1/operators/${operatorId}/avs/${avsId}/history`,
    method: "get",
  });

export const getAVSRelationshipTimeline = async (
  operatorId: string,
  avsId: string,
  params: AVSTimelineParams
) => {
  const queryString = `?${new URLSearchParams(params as any).toString()}`;
  return handleApiAction<AVSTimeline>({
    endpoint: `/api/v1/operators/${operatorId}/avs/${avsId}/timeline${queryString}`,
    method: "get",
  });
};
