// ==================== NETWORK TYPES ====================

// Raw structure from the backend API
export interface RawNetworkStats {
  operators: {
    total_operators: number;
    active_operators: number;
    inactive_operators: number;
  };
  tvs: {
    total_tvs: string;
    mean_tvs: string;
    median_tvs: string;
  };
  delegation: {
    total_delegators: number;
    mean_delegators_per_operator: string;
    median_delegators_per_operator: string;
  };
  avs: {
    total_avs: number;
    mean_avs_per_operator: string;
  };
  commission: {
    mean_pi_commission: string;
    median_pi_commission: string;
  };
  last_updated: string;
}

// Flat structure used in the UI
export interface NetworkStats {
  totalOperators: number;
  activeOperators: number;
  totalTVS: number;
  totalDelegators: number;
  totalAVS: number;
  averageCommission: number;
  medianCommission: number;
  timestamp: string;
}
