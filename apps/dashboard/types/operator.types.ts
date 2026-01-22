/* eslint-disable @typescript-eslint/no-explicit-any */

import { Strategy } from "./strategy.types";

// ==================== OPERATOR TYPES ====================

export type OperatorStatus = "active" | "inactive" | "all";
export type SortOrder = "asc" | "desc";
export type OperatorSortBy =
  | "tvs"
  | "delegator_count"
  | "avs_count"
  | "operational_days"
  | "risk_score";

export interface OperatorListParams {
  limit?: number;
  offset?: number;
  status?: OperatorStatus;
  min_tvs?: number;
  max_tvs?: number;
  min_delegators?: number;
  max_delegators?: number;
  min_avs_count?: number;
  max_avs_count?: number;
  has_been_slashed?: boolean;
  is_permissioned?: boolean;
  search?: string;
  sort_by?: OperatorSortBy;
  sort_order?: SortOrder;
}

export interface OperatorMetadata {
  name?: string;
  logo?: string;
  website?: string;
  description?: string;
  [key: string]: any;
}

export interface Operator {
  operator_id: string;
  operator_address: string;
  is_active: boolean;
  total_tvs: string;
  delegator_count: number;
  active_avs_count: number;
  operational_days: number;
  current_pi_commission_bips: number;
  total_slash_events: number;
  risk_level: "CRITICAL" | "LOW" | "MEDIUM" | "HIGH";
  risk_score: string;
  metadata: OperatorMetadata | null;
}

export interface OperatorDetail {
  operator_id: string;
  operator_address: string;
  metadata: OperatorMetadata | null;
  status: {
    is_active: boolean;
    is_permissioned: boolean;
    registered_at: string;
    first_activity_at: string;
    operational_days: number;
    last_activity_at: string;
  };
  delegation_config: {
    current_delegation_approver: string;
    delegation_approver_updated_at: string;
  };
  performance_summary: {
    total_slash_events: number;
    last_slashed_at: string | null;
    force_undelegation_count: number;
  };
}

// New interface for the enhanced strategy data
export interface StrategyTVS {
  strategy_address: string;
  token: {
    name: string;
    symbol: string;
    logo_url: string | null;
    decimals: number;
  };
  tvs_usd: number;
  tvs_percentage: number;
  utilization_rate: number;
  delegator_count: number;
}

export interface OperatorStats {
  tvs: {
    total: number;
    by_strategy: StrategyTVS[];
  };
  delegation: {
    total_delegators: number;
    active_delegators: number;
    total_shares: string;
  };
  avs_participation: {
    active_avs_count: number;
    registered_avs_count: number;
    active_operator_set_count: number;
  };
  commission: {
    pi_split_bips: number;
    pi_split_activated_at: string;
  };
}

export type ActivityType =
  | "registration"
  | "delegation"
  | "allocation"
  | "commission"
  | "metadata"
  | "slashing";

export interface ActivityParams {
  activity_types?: ActivityType[];
  limit?: number;
  offset?: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: string;
  description: string;
  txHash?: string;
  blockNumber?: number;
  metadata?: Record<string, any>;
}

// ==================== COMPARISON TYPES ====================

export interface CompareOperatorsRequest {
  operator_ids: string[];
  metrics?: string[];
}

export interface CompareOperatorsResponse {
  operators: OperatorComparison[];
  metrics: string[];
}

export interface OperatorComparison {
  operatorId: string;
  name: string;
  metrics: Record<string, number | string>;
}

export interface OperatorRankings {
  operatorId: string;
  rankings: Record<string, PercentileRank>;
  date: string;
}

export interface PercentileRank {
  value: number;
  percentile: number;
  rank: number;
  totalOperators: number;
}

export interface NetworkComparison {
  operator: Record<string, number>;
  networkMean: Record<string, number>;
  networkMedian: Record<string, number>;
  percentile: Record<string, number>;
  date: string;
}
