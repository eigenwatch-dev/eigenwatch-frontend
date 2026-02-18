"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, TrendingUp, PieChart } from "lucide-react";
import { StatCard } from "@/components/shared/data/StatCard";
import ReusableTable from "@/components/shared/table/ReuseableTable";
import { DonutChart } from "@/components/shared/charts/DonutChart";
import { ProGate } from "@/components/shared/ProGate";
import { useProAccess } from "@/hooks/useProAccess";

import { useOperatorStats } from "@/hooks/crud/useOperator";
import { StrategyTVS } from "@/types/operator.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StrategiesTabProps {
  operatorId: string;
}

const StrategiesTab = ({ operatorId }: StrategiesTabProps) => {
  const { isFree } = useProAccess();
  const { data: statsData, isLoading } = useOperatorStats(operatorId);

  const strategies = statsData?.tvs.by_strategy || [];
  const totalTVS = statsData?.tvs.total || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!strategies || strategies.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <PieChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Strategies Found</h3>
          <p className="text-sm text-muted-foreground">
            This operator doesn&apos;t have any strategies configured yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find top strategy for "Dominance" card
  const topStrategy =
    strategies.length > 0
      ? strategies.reduce((prev, current) => {
          return prev.tvs_usd > current.tvs_usd ? prev : current;
        })
      : null;

  // Dynamic color generation
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 50%)`;
  };

  // Prepare data for pie chart with dynamic colors
  const pieChartData = strategies.map((strategy) => ({
    name: strategy.token?.symbol || "Unknown",
    value: strategy.tvs_usd,
    percentage: strategy.tvs_percentage,
    color: stringToColor(strategy.token?.symbol || strategy.strategy_address),
  }));

  const chartColors = pieChartData.map((d) => d.color);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Strategies"
          value={strategies.length}
          subtitle="Unique asset strategies"
        />

        <StatCard
          title="Combined TVS"
          value={`$${totalTVS.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Total delegated value"
          tooltip="Total value across all strategies"
          icon={<Info className="h-4 w-4" />}
        />

        <StatCard
          title="Dominance"
          value={`${topStrategy?.tvs_percentage.toFixed(1)}%`}
          subtitle={topStrategy?.token?.name || "Highest Share"}
          tooltip="The strategy with the highest share of total TVS"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* TVS Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>TVS Distribution by Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonutChart
              data={pieChartData}
              category="value"
              index="name"
              colors={chartColors}
              valueFormatter={(value) =>
                `$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              }
              height={300}
            />

            <div className="flex flex-col justify-center space-y-3">
              <h4 className="font-semibold mb-2">Strategy Breakdown</h4>
              {pieChartData.slice(0, 8).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium block">
                      ${item.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategies Table */}
      <ProGate
        isLocked={isFree}
        feature="Strategy Details"
        description="Unlock the full strategy table with exact amounts, share percentages, and delegator counts per strategy."
      >
      <ReusableTable
        columns={[
          { key: "token", displayName: "Strategy" },
          { key: "tvs_usd", displayName: "Total Value" },
          { key: "tvs_percentage", displayName: "Share" },
          { key: "delegator_count", displayName: "Delegators" },
        ]}
        data={strategies.map((s: StrategyTVS) => {
          return {
            ...s,
            id: s.strategy_address,
            tvs_usd: (
              <div className="space-y-1">
                <p className="font-medium">
                  $
                  {s.tvs_usd.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            ),
            tvs_percentage: (
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {s.tvs_percentage.toFixed(2)}%
                </span>
              </div>
            ),
            delegator_count: (
              <Badge variant="secondary">{s.delegator_count || 0}</Badge>
            ),
            token: (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={s.token?.logo_url || ""} />
                  <AvatarFallback>
                    {s.token?.symbol?.slice(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-medium">
                    {s.token?.name || "Unknown Strategy"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {s.token?.symbol || s.strategy_address.slice(0, 8)}
                  </p>
                </div>
              </div>
            ),
          };
        })}
        tableFilters={{ title: "All Strategies" }}
      />
      </ProGate>
    </div>
  );
};

export default StrategiesTab;
