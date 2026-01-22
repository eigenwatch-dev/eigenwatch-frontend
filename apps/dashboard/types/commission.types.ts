// ==================== COMMISSION TYPES ====================

export type CommissionType = "pi" | "avs" | "operator_set";

export interface NetworkCommissionBenchmarks {
  mean_pi_commission_bips: number;
  median_pi_commission_bips: number;
  p25_pi_commission_bips: number;
  p75_pi_commission_bips: number;
  p90_pi_commission_bips: number;
}

export interface BehaviorProfile {
  days_since_last_change: number;
  changes_last_12m: number;
  max_historical_bips: number;
  is_change_pending: boolean;
}

export interface CommissionOverview {
  pi_commission: number | null;
  avs_commissions: CommissionByAVS[];
  operator_set_commissions: CommissionByOperatorSet[];
  network_benchmarks?: NetworkCommissionBenchmarks;
  behavior_profile?: BehaviorProfile;
}

export interface CommissionByAVS {
  avs_id: string;
  avs_name: string;
  current_bips: number;
  activated_at: string;
  upcoming_bips: number | null;
  upcoming_activated_at: string | null;
  total_changes: number;
  first_set_at: string;
}

export interface CommissionByOperatorSet {
  operatorSetId: string;
  operatorSetName: string;
  commission: number;
}

export interface CommissionHistoryParams {
  commission_type?: CommissionType;
  avs_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface CommissionHistory {
  changes: CommissionChange[];
}

export interface CommissionChange {
  type: CommissionType;
  oldRate: number;
  newRate: number;
  timestamp: string;
  effectBlock: number;
  avsId?: string;
  operatorSetId?: string;
}
