// ==================== DELEGATOR TYPES ====================

import { SortOrder } from "./operator.types";

export type DelegatorStatus = "active" | "inactive" | "all";
export type DelegatorSortBy = "shares" | "delegation_date";

export interface DelegatorListParams {
  limit?: number;
  offset?: number;
  status?: DelegatorStatus;
  min_shares?: number;
  max_shares?: number;
  sort_by?: DelegatorSortBy;
  sort_order?: SortOrder;
}

export interface DelegatorsResponse {
  delegators: Delegator[];
  summary: {
    total_delegators: number;
    active_delegators: number;
    total_shares: string;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
    next_offset: number;
  };
}

export interface Delegator {
  staker_id: string;
  staker_address: string;
  is_delegated: boolean;
  delegated_at: string;
  undelegated_at: string | null;
  total_shares: string;
  total_tvs: string;
  shares_percentage: string;
  strategies: DelegatorStrategy[];
}

export interface DelegatorDetail extends Delegator {
  strategiesBreakdown: DelegatorStrategy[];
  totalValue: number;
}

export interface DelegatorStrategy {
  strategy_id: string;
  strategy_name: string;
  shares: string;
  tvs: string;
}

export type DelegationEventType =
  | "delegated"
  | "undelegated"
  | "force_undelegated"
  | "all";

export interface DelegationHistoryParams {
  limit?: number;
  offset?: number;
  event_type?: DelegationEventType;
  date_from?: string;
  date_to?: string;
}

export interface DelegationHistory {
  events: DelegationEvent[];
}

export interface DelegationEvent {
  type: DelegationEventType;
  stakerId: string;
  shares: number;
  timestamp: string;
  txHash: string;
}
