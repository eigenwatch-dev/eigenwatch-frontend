/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/operator/tabs/OverviewTab.tsx
"use client";

import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingUp, Users, Shield, AlertCircle } from "lucide-react";
import { ProGate } from "@/components/shared/ProGate";
import { useProAccess } from "@/hooks/useProAccess";
import { useDailySnapshots } from "@/hooks/crud/useOperator";
import { OperatorDetail } from "@/types/operator.types";
import { SectionContainer } from "@/components/shared/data/SectionContainer";
import { MetricProgress } from "@/components/shared/data/MetricProgress";
import { ActivityItem } from "@/components/shared/data/ActivityItem";
import { AreaChart } from "@/components/shared/charts/AreaChart";
import { LineChart } from "@/components/shared/charts/LineChart";
import { EDUCATIONAL_TOOLTIPS } from "@/lib/educational-content";

import { useRiskAssessment } from "@/hooks/crud/useOperatorRisk";
import { useOperatorActivity } from "@/hooks/crud/useOperator";

interface OverviewTabProps {
  operator: OperatorDetail;
}

// Sample data to show ~30 points for better chart readability
function sampleData<T>(data: T[], targetPoints: number = 30): T[] {
  if (data.length <= targetPoints) return data;
  const step = Math.ceil(data.length / targetPoints);
  return data.filter((_, index) => index % step === 0);
}

// Format date based on data density
function formatDateForChart(dateStr: string, isLongRange: boolean): string {
  const date = new Date(dateStr);
  if (isLongRange) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Compact number formatter for Y-axis labels (e.g., 1.2K, 3.5M)
function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  if (value >= 1) return value.toFixed(1);
  if (value > 0) return value.toFixed(2);
  return "0";
}

// Integer formatter for count axes (delegators, AVS)
function integerFormat(value: number): string {
  return Math.floor(value).toLocaleString();
}

const OverviewTab = ({ operator }: OverviewTabProps) => {
  const { isFree } = useProAccess();
  const { data: riskData, isLoading: loadingRisk } = useRiskAssessment(
    operator?.operator_id,
  );
  const { data: activityData, isLoading: loadingActivity } =
    useOperatorActivity(operator?.operator_id, { limit: 10 });
  const activity = activityData?.data?.data || [];
  const isLoading = loadingRisk || loadingActivity;

  // Get last 6 months of snapshots
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const { data: snapshotsData, isLoading: loadingSnapshots } =
    useDailySnapshots(operator?.operator_id, {
      date_from: startDate.toISOString().split("T")[0] || "",
      date_to: endDate.toISOString().split("T")[0] || "",
      metrics: ["tvs", "delegator_count", "active_avs_count"],
    });

  const snapshots = snapshotsData?.snapshots || [];

  // Transform and sample data for charts
  const chartData = useMemo(() => {
    const transformed = snapshots.map((snapshot: any) => ({
      date: formatDateForChart(snapshot.date, true),
      fullDate: snapshot.date,
      tvs: parseFloat(snapshot.tvs || snapshot.tvs_eth || "0") / 1e18,
      tvs_usd: parseFloat(snapshot.tvs_usd || "0"),
      delegators: snapshot.delegator_count || 0,
      avs: snapshot.active_avs_count || 0,
    }));

    // Sample to ~30 points for better readability
    return sampleData(transformed, 30);
  }, [snapshots]);

  // Check if we have meaningful TVS data
  const hasTvsData = chartData.some((d) => d.tvs > 0 || d.tvs_usd > 0);
  const hasDelegatorData = chartData.some((d) => d.delegators > 0);
  const hasAvsData = chartData.some((d) => d.avs > 0);

  // Calculate trends
  const tvsTrend = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0]?.tvs || 0;
    const last = chartData[chartData.length - 1]?.tvs || 0;
    if (first === 0) return null;
    return (((last - first) / first) * 100).toFixed(1);
  }, [chartData]);

  const delegatorTrend = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0]?.delegators || 0;
    const last = chartData[chartData.length - 1]?.delegators || 0;
    if (first === 0) return null;
    return (((last - first) / first) * 100).toFixed(1);
  }, [chartData]);

  const avsTrend = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0]?.avs || 0;
    const last = chartData[chartData.length - 1]?.avs || 0;
    if (first === 0) return null;
    return (((last - first) / first) * 100).toFixed(1);
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* Performance Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Scores */}
        <SectionContainer heading="Performance Overview">
          <ProGate
            isLocked={isFree}
            feature="Performance Scores"
            description="Unlock detailed performance scores, risk breakdown, and confidence metrics with a Pro subscription."
          >
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {/* Risk Score */}
                <MetricProgress
                  metric="Risk Score"
                  value={Number(riskData?.scores?.risk) || 0}
                />

                <div className="pt-3 space-y-3 border-t border-border">
                  <MetricProgress
                    metric="Performance Score"
                    value={Number(riskData?.scores?.performance) || 0}
                  />
                  <MetricProgress
                    metric="Economic Score"
                    value={Number(riskData?.scores?.economic) || 0}
                  />
                  <MetricProgress
                    metric="Network Position"
                    value={Number(riskData?.scores?.network_position) || 0}
                  />
                </div>

                {/* Key Stats */}
                <div className="pt-3 space-y-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Confidence Score
                    </span>
                    <Badge variant="outline" className="text-muted-foreground">
                      {riskData?.scores?.confidence || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Delegation Volatility
                    </span>
                    <Badge
                      variant="outline"
                      className="text-green-500 border-green-500/30"
                    >
                      Stable
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </ProGate>
        </SectionContainer>

        {/* Recent Activity */}
        <SectionContainer heading="Recent Activity">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity && activity.length > 0 ? (
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {activity.map((item: any, index: number) => (
                <ActivityItem
                  key={index}
                  type={item.type}
                  description={item.description}
                  time={item.timestamp}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Activity className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </SectionContainer>
      </div>

      {/* TVS Trend Chart */}
      <SectionContainer
        heading="Total Value Secured - 6 Month Trend"
        info={EDUCATIONAL_TOOLTIPS.tvs.detailed}
      >
        {loadingSnapshots ? (
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : hasTvsData && chartData.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm px-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>
                  Current:{" "}
                  {compactNumber(chartData[chartData.length - 1]?.tvs || 0)} ETH
                </span>
              </div>
              {tvsTrend && (
                <Badge
                  variant="outline"
                  className={
                    parseFloat(tvsTrend) >= 0
                      ? "text-green-500 border-green-500/30"
                      : "text-red-500 border-red-500/30"
                  }
                >
                  {parseFloat(tvsTrend) >= 0 ? "+" : ""}
                  {tvsTrend}%
                </Badge>
              )}
            </div>
            <AreaChart
              data={chartData}
              index="date"
              categories={["tvs"]}
              colors={["var(--chart-1)"]}
              valueFormatter={(value) => `${compactNumber(value)} ETH`}
              height={300}
            />
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-lg border border-dashed border-border">
            <div className="text-center p-6">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                TVS Historical Data Not Available
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Historical TVS tracking is being implemented. Current TVS is
                shown in the header.
              </p>
            </div>
          </div>
        )}
      </SectionContainer>

      {/* Delegator & AVS Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delegators Trend */}
        <SectionContainer
          heading="Delegators Over Time"
          info="Number of unique addresses delegating to this operator over time"
        >
          {loadingSnapshots ? (
            <Skeleton className="h-[220px] w-full" />
          ) : hasDelegatorData && chartData.length > 0 ? (
            <div className="space-y-2">
              {/* Trend indicator */}
              <div className="flex items-center justify-between text-sm px-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    Current: {chartData[chartData.length - 1]?.delegators || 0}
                  </span>
                </div>
                {delegatorTrend && (
                  <Badge
                    variant="outline"
                    className={
                      parseFloat(delegatorTrend) >= 0
                        ? "text-green-500 border-green-500/30"
                        : "text-red-500 border-red-500/30"
                    }
                  >
                    {parseFloat(delegatorTrend) >= 0 ? "+" : ""}
                    {delegatorTrend}%
                  </Badge>
                )}
              </div>
              <LineChart
                data={chartData}
                index="date"
                categories={["delegators"]}
                colors={["var(--chart-2)"]}
                valueFormatter={integerFormat}
                height={200}
              />
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm bg-muted/30 rounded-lg">
              No delegator data available
            </div>
          )}
        </SectionContainer>

        {/* AVS Count Trend */}
        <SectionContainer
          heading="AVS Registrations Over Time"
          info={EDUCATIONAL_TOOLTIPS.avs.short}
        >
          {loadingSnapshots ? (
            <Skeleton className="h-[220px] w-full" />
          ) : hasAvsData && chartData.length > 0 ? (
            <div className="space-y-2">
              {/* Trend indicator */}
              <div className="flex items-center justify-between text-sm px-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>
                    Current: {chartData[chartData.length - 1]?.avs || 0} AVS
                  </span>
                </div>
                {avsTrend && (
                  <Badge
                    variant="outline"
                    className={
                      parseFloat(avsTrend) >= 0
                        ? "text-green-500 border-green-500/30"
                        : "text-red-500 border-red-500/30"
                    }
                  >
                    {parseFloat(avsTrend) >= 0 ? "+" : ""}
                    {avsTrend}%
                  </Badge>
                )}
              </div>
              <LineChart
                data={chartData}
                index="date"
                categories={["avs"]}
                colors={["var(--chart-3)"]}
                valueFormatter={integerFormat}
                height={200}
              />
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm bg-muted/30 rounded-lg">
              No AVS data available
            </div>
          )}
        </SectionContainer>
      </div>

      {/* Educational note */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <span className="text-lg">📊</span>
          Reading These Charts
        </h4>
        <p className="text-sm text-muted-foreground">
          These charts show 6 months of historical data. Flat lines indicate
          stable metrics, which can be positive (consistent delegator count) or
          may reflect limited data availability. Trend badges show percentage
          change over the period.
        </p>
      </div>
    </div>
  );
};

export default OverviewTab;
