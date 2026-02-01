// ==================== ALLOCATION TYPES ====================

import { SortOrder } from "./operator.types";

// Enhanced allocation summary with USD values
export interface AllocationsSummary {
  total_allocated_usd: string;
  total_tvs_usd: string;
  overall_utilization_pct: string;
  total_avs_count: number;
  total_operator_set_count: number;
  total_allocation_count: number;
}

// Enhanced allocation overview response
export interface AllocationsOverview {
  // Summary metrics (USD-based)
  summary?: AllocationsSummary;

  // Legacy fields (keep for backward compatibility)
  total_allocations?: number;
  total_encumbered_magnitude?: number;

  // Per-AVS breakdown
  by_avs: AllocationByAVS[];

  // Per-strategy breakdown
  by_strategy: AllocationByStrategy[];

  // Risk indicators
  risk_metrics?: AllocationRiskMetrics;
}

export interface AllocationByAVS {
  // IDs
  avs_id?: string;
  avsId?: string; // Legacy

  // Names
  avs_name?: string;
  avsName?: string; // Legacy
  avs_address?: string;
  avs_logo?: string | null;

  // USD values (enhanced)
  total_allocated_usd?: string;
  allocation_share_pct?: string;

  // Legacy magnitude (kept for reference, not to be summed)
  totalMagnitude?: number;
  total_magnitude?: string;

  // Operator sets
  operator_set_count?: number;
  operator_sets?: number;

  // Strategies used
  strategies?: number;
  strategies_used?: {
    strategy_id: string;
    strategy_symbol: string;
    allocated_usd: string;
  }[];
}

export interface AllocationByStrategy {
  // IDs
  strategy_id?: string;
  strategyId?: string; // Legacy
  strategy_address?: string;

  // Names
  strategy_symbol?: string;
  strategyName?: string; // Legacy
  strategy_logo?: string | null;

  // USD values (enhanced)
  tvs_usd?: string;
  allocated_usd?: string;
  available_usd?: string;

  // Utilization
  utilization_pct?: string;
  utilization_status?: "low" | "moderate" | "high" | "critical";

  // Legacy
  totalMagnitude?: number;

  // AVS count
  avs_count?: number;
  avsCount?: number; // Legacy
}

export interface AllocationRiskMetrics {
  avs_concentration_hhi: number;
  strategy_concentration_hhi: number;
  highest_single_avs_exposure_pct: string;
  utilization_risk_level: "low" | "moderate" | "high";
}

export type AllocationSortBy = "magnitude" | "effect_block" | "allocated_at";

export interface DetailedAllocationParams {
  limit?: number;
  offset?: number;
  avs_id?: string;
  strategy_id?: string;
  min_magnitude?: number;
  max_magnitude?: number;
  sort_by?: AllocationSortBy;
  sort_order?: SortOrder;
}

export interface DetailedAllocationItem {
  allocation_id: string;

  // AVS/Operator Set info
  avs_id: string;
  avs_name: string;
  avs_logo?: string | null;
  operator_set_id: string;
  operator_set_number: number;

  // Strategy info
  strategy_id: string;
  strategy_symbol: string;
  strategy_logo?: string | null;

  // Magnitude (ratio) - kept for reference
  magnitude_raw: string;
  magnitude_pct: string;

  // USD value
  allocated_usd: string;

  // Commission
  commission?: {
    effective_bips: number;
    source: "pi" | "avs" | "operator_set";
    display_pct: string;
  } | null;

  // Timing
  allocated_at: string;
  effect_block: number;
}

// Legacy type for backward compatibility
export interface Allocation {
  id: string;
  operatorSetId: string;
  strategyId: string;
  magnitude: number;
  effectBlock: number;
  allocatedAt: string;
  avsId: string;
  avsName: string;
  strategyName: string;
}
