/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { handleApiAction } from "@/lib/handleApiAction";
import { serializeParams } from "@/lib/utils";
import {
  DelegatorSharesHistoryParams,
  DelegatorSharesHistory,
} from "@/types/daily_snapshots.types";
import {
  DelegatorListParams,
  Delegator,
  DelegatorDetail,
  DelegationHistoryParams,
  DelegationHistory,
  DelegatorsResponse,
} from "@/types/delegator.types";

// ==================== DELEGATORS ====================

export const getOperatorDelegators = async (
  id: string,
  params?: DelegatorListParams
) => {
  const queryString = serializeParams(params as any);
  return handleApiAction<DelegatorsResponse>({
    endpoint: `/api/v1/operators/${id}/delegators${queryString}`,
    method: "get",
  });
};

export const getDelegatorDetail = async (
  operatorId: string,
  stakerId: string
) =>
  handleApiAction<DelegatorDetail>({
    endpoint: `/api/v1/operators/${operatorId}/delegators/${stakerId}`,
    method: "get",
  });

export const getDelegationHistory = async (
  id: string,
  params?: DelegationHistoryParams
) => {
  const queryString = serializeParams(params as any);
  return handleApiAction<DelegationHistory>({
    endpoint: `/api/v1/operators/${id}/delegators/history${queryString}`,
    method: "get",
  });
};

export const getDelegatorSharesHistory = async (
  operatorId: string,
  stakerId: string,
  params?: DelegatorSharesHistoryParams
) => {
  const queryString = serializeParams(params as any);
  return handleApiAction<DelegatorSharesHistory>({
    endpoint: `/api/v1/operators/${operatorId}/delegators/${stakerId}/shares/history${queryString}`,
    method: "get",
  });
};
