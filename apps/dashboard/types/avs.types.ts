// ==================== AVS TYPES ====================

export type AVSStatus = "registered" | "unregistered" | "all";
export type AVSSortBy =
  | "days_registered"
  | "operator_set_count"
  | "registration_cycles";

export interface AVSListParams {
  status?: AVSStatus;
  sort_by?: AVSSortBy;
  limit?: number;
  offset?: number;
}

export interface AVSRelationship {
  avs_id: string;
  avs_address: string;
  avs_name: string;
  avs_logo?: string;
  current_status: string;
  current_status_since: string;
  first_registered_at: string;
  total_days_registered: number;
  current_period_days: number;
  total_registration_cycles: number;
  active_operator_set_count: number;
  avs_commission_bips: number;
  // Legacy fields that might still be used
  status?: string;
  days_registered?: number;
  operator_set_count?: number;
  total_allocated_usd?: string;
  effective_commission_bips?: number;
  effective_commission_pct?: string;
  commission?: number;
  operator_sets?: number;
  commissions?: string;
}

export interface AVS {
  id: string;
  address: string;
  name: string;
  logo?: string;
  website?: string;
  status: "registered" | "unregistered";
  daysRegistered: number;
  operatorSetCount: number;
  registrationCycles: number;
  registeredAt?: string;
  unregisteredAt?: string;
}

export interface AVSListResponse {
  total_avs: number;
  active_avs: number;
  avs_relationships: AVSRelationship[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface AVSDetail extends AVS {
  operatorSets: OperatorSet[];
  commission: number;
}

export interface OperatorSet {
  id: string;
  name: string;
  operatorCount: number;
}

export interface AVSRegistrationHistory {
  events: AVSRegistrationEvent[];
}

export interface AVSRegistrationEvent {
  type: "registered" | "unregistered";
  timestamp: string;
  blockNumber: number;
  txHash: string;
}
