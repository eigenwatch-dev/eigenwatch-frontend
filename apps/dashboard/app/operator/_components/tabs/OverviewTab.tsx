/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/operator/tabs/OverviewTab.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingUp } from "lucide-react";
import { useDailySnapshots } from "@/hooks/crud/useOperator";
import { OperatorDetail } from "@/types/operator.types";
import { SectionContainer } from "@/components/shared/data/SectionContainer";
import { MetricProgress } from "@/components/shared/data/MetricProgress";
import { ActivityItem } from "@/components/shared/data/ActivityItem";
import { AreaChart } from "@/components/shared/charts/AreaChart";
import { LineChart } from "@/components/shared/charts/LineChart";

import { useRiskAssessment } from "@/hooks/crud/useOperatorRisk";
import { useOperatorActivity } from "@/hooks/crud/useOperator";

interface OverviewTabProps {
  operator: OperatorDetail;
}

const OverviewTab = ({ operator }: OverviewTabProps) => {
  const { data: riskData, isLoading: loadingRisk } = useRiskAssessment(
    operator?.operator_id
  );
  const { data: activityData, isLoading: loadingActivity } = useOperatorActivity(
    operator?.operator_id,
    { limit: 10 }
  );
  const activity = activityData?.data?.data || [];
  const isLoading = loadingRisk || loadingActivity;
  // Get last 30 days of snapshots
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const { data: snapshotsData, isLoading: loadingSnapshots } =
    useDailySnapshots(operator?.operator_id, {
      date_from: startDate.toISOString().split("T")[0] || "",
      date_to: endDate.toISOString().split("T")[0] || "",
      metrics: ["tvs", "delegator_count", "active_avs_count"],
    });

  const snapshots = snapshotsData?.snapshots || [];
  

  // Transform data for charts
  const chartData = snapshots?.map((snapshot: any) => ({
    date: new Date(snapshot.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    tvs: parseFloat(snapshot.tvs || "0") / 1e18,
    delegators: snapshot.delegator_count,
    avs: snapshot.active_avs_count,
  }));

  return (
    <div className="space-y-4">
      {/* Performance Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Scores */}
        <SectionContainer heading="Performance Overview">
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
            <div className="space-y-3 text-sm ">
              {/* Risk Score */}
              <MetricProgress
                metric="Risk Score"
                value={Number(riskData?.scores.risk) || 0}
              />

              {/* Mock Additional Scores - Replace with real data when available */}
              <div className="pt-3 space-y-3 border-t border-white/10">
                <MetricProgress
                  metric="Performance Score"
                  value={
                    Number(riskData?.scores.performance) || 0
                  }
                />
                <MetricProgress
                  metric="Economic Score"
                  value={Number(riskData?.scores.economic) || 0}
                />
                <MetricProgress
                  metric="Network Position"
                  value={
                    Number(riskData?.scores.network_position) ||
                    0
                  }
                />
              </div>

              {/* Key Stats */}
              <div className="pt-3 space-y-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Confidence Score</span>
                  <Badge className="bg-transparent text-muted-foreground">
                    {riskData?.scores.confidence}%
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delegation Volatility</span>
                  <Badge className="text-green-500 bg-transparent">
                    Stable
                  </Badge>
                </div>
              </div>
            </div>
          )}
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
            <div className="text-center text-muted-foreground my-auto">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </SectionContainer>
      </div>

      {/* TVS Trend Chart */}
      <SectionContainer heading="Total Value Secured - Last 30 Days">
        {loadingSnapshots ? (
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : chartData.length > 0 ? (
          <AreaChart
            data={chartData}
            index="date"
            categories={["tvs"]}
            colors={["hsl(var(--primary))"]}
            valueFormatter={(value) => `${value.toFixed(2)} ETH`}
            height={300}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground my-auto">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                No data available for the selected period
              </p>
            </div>
          </div>
        )}
      </SectionContainer>

      {/* Delegator & AVS Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delegators Trend */}
        <SectionContainer heading="Delegators Growth">
          {loadingSnapshots ? (
            <Skeleton className="h-48 w-full" />
          ) : chartData.length > 0 ? (
            <LineChart
              data={chartData}
              index="date"
              categories={["delegators"]}
              colors={["hsl(var(--chart-2))"]}
              height={200}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground my-auto text-sm">
              No data available
            </div>
          )}
        </SectionContainer>

        {/* AVS Count Trend */}
        <SectionContainer heading="AVS Registrations">
          {loadingSnapshots ? (
            <Skeleton className="h-48 w-full" />
          ) : chartData.length > 0 ? (
            <LineChart
              data={chartData}
              index="date"
              categories={["avs"]}
              colors={["hsl(var(--chart-3))"]}
              height={200}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground my-auto text-sm">
              No data available
            </div>
          )}
        </SectionContainer>
      </div>
    </div>
  );
};

export default OverviewTab;
