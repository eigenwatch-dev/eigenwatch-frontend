"use server";

import { handleApiAction } from "@/lib/handleApiAction";
import {
  OperatorRiskProfile,
  ConcentrationType,
  ConcentrationMetric,
  VolatilityMetricType,
  VolatilityMetric,
} from "@/types/risk.types";

// ==================== RISK & ANALYTICS ====================

export const getRiskAssessment = async (id: string, date?: string) => {
  const queryString = date ? `?date=${date}` : "";
  return handleApiAction<OperatorRiskProfile>({
    endpoint: `/api/v1/operators/${id}/risk${queryString}`,
    method: "get",
  });
};

export const getConcentrationMetrics = async (
  id: string,
  concentrationType: ConcentrationType = "delegation",
  date?: string
) => {
  const params = new URLSearchParams({ concentration_type: concentrationType });
  if (date) params.append("date", date);
  return handleApiAction<ConcentrationMetric>({
    endpoint: `/api/v1/operators/${id}/concentration?${params.toString()}`,
    method: "get",
  });
};

export const getVolatilityMetrics = async (
  id: string,
  metricType: VolatilityMetricType = "tvs",
  date?: string
) => {
  const params = new URLSearchParams({ metric_type: metricType });
  if (date) params.append("date", date);
  return handleApiAction<VolatilityMetric>({
    endpoint: `/api/v1/operators/${id}/volatility?${params.toString()}`,
    method: "get",
  });
};
