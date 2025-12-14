// ==================== RISK & ANALYTICS TYPES ====================

export interface ConcentrationMetric {
  concentration_type: string;
  date: string;
  hhi_value: string;
  gini_coefficient: string | null;
  top_1_percentage: string | null;
  top_5_percentage: string | null;
  top_10_percentage: string | null;
  total_entities: number;
  effective_entities: string | null;
}

export interface VolatilityMetric {
  metric_type: string;
  date: string;
  volatility_7d: string | null;
  volatility_30d: string | null;
  volatility_90d: string | null;
  mean_value: string | null;
  coefficient_of_variation: string | null;
  trend_direction: string | null;
  trend_strength: string | null;
  confidence_score: string | null;
}

export interface OperatorRiskProfile {
  operator_id: string;
  assessment_date: string;
  scores: {
    risk: number; // 0-100
    confidence: number;
    performance: number;
    economic: number;
    network_position: number;
  };
  risk_level: string; // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  flags: {
    is_active: boolean;
    has_been_slashed: boolean;
    has_sufficient_data: boolean;
  };
  metrics: {
    delegation: {
      hhi: number;
      volatility_30d: number;
      growth_rate_30d: number;
      distribution_cv: number;
      size_percentile: number;
    };
    slashing: {
      count: number;
      lifetime_amount: string;
    };
    activity: {
      operational_days: number;
    };
  };
  concentration: {
    delegation: ConcentrationMetric | null;
    allocation_by_avs: ConcentrationMetric | null;
    allocation_by_strategy: ConcentrationMetric | null;
  };
  volatility: {
    tvs: VolatilityMetric | null;
    delegators: VolatilityMetric | null;
  };
}

export type ConcentrationType =
  | "delegation"
  | "allocation_by_avs"
  | "allocation_by_strategy";

export type VolatilityMetricType = "tvs" | "delegators" | "avs_count";
