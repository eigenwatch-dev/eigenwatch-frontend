// ==================== SNAPSHOT TYPES ====================

export interface DailySnapshotsParams {
  date_from: string;
  date_to: string;
  metrics?: string[];
}

export interface DailySnapshot {
  date: string;
  block_number: number;
  delegator_count: number;
  active_avs_count: number;
  active_operator_set_count: number;
  pi_split_bips: number | null;
  slash_event_count_to_date: number;
  operational_days: number;
  is_active: boolean;
  tvs_usd: string;
}

export interface StrategyTVSHistoryParams {
  date_from: string;
  date_to: string;
}

export interface StrategyTVSHistory {
  data: StrategyTVSPoint[];
}

export interface StrategyTVSPoint {
  date: string;
  tvs: number;
  utilizationRate: number;
  encumbered: number;
}

export interface DelegatorSharesHistoryParams {
  date_from?: string;
  date_to?: string;
  strategy_id?: string;
}

export interface DelegatorSharesHistory {
  data: DelegatorSharesPoint[];
}

export interface DelegatorSharesPoint {
  date: string;
  strategyId: string;
  strategyName: string;
  shares: number;
}

export interface AVSTimelineParams {
  date_from: string;
  date_to: string;
}

export interface AVSTimeline {
  data: AVSTimelinePoint[];
}

export interface AVSTimelinePoint {
  date: string;
  isRegistered: boolean;
  operatorSetCount: number;
}

export interface AllocationHistoryParams {
  date_from: string;
  date_to: string;
  operator_set_id?: string;
  strategy_id?: string;
}

export interface AllocationHistoryData {
  data: AllocationHistoryPoint[];
}

export interface AllocationHistoryPoint {
  date: string;
  magnitude: number;
  operatorSetId: string;
  strategyId: string;
}
