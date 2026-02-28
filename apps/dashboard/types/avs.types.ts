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
