"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Info,
  TrendingUp,
  PieChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { StatCard } from "@/components/shared/data/StatCard";
import ReusableTable from "@/components/shared/table/ReuseableTable";
import { DonutChart } from "@/components/shared/charts/DonutChart";
import { ProGate } from "@/components/shared/ProGate";
import { useProAccess } from "@/hooks/useProAccess";

import {
  useOperatorStats,
  useOperatorStrategies,
} from "@/hooks/crud/useOperator";
import { OperatorStrategyListItem } from "@/types/operator.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface StrategiesTabProps {
  operatorId: string;
}

const StrategiesTab = ({ operatorId }: StrategiesTabProps) => {
  const { isFree } = useProAccess();

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch Stats (for Charts & Summary) - keeps full distribution data
  const { data: statsData, isLoading: isStatsLoading } =
    useOperatorStats(operatorId);

  // Fetch Strategies (Paginated for Table)
  const { data: strategiesData, isLoading: isStrategiesLoading } =
    useOperatorStrategies(operatorId, {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      sort_by: "tvs", // Default sort
    });

  const allStrategies = statsData?.tvs.by_strategy || [];
  const paginatedStrategies = strategiesData?.strategies || [];
  const totalStrategiesCount =
    strategiesData?.total_strategies || allStrategies.length || 0;
  const totalTVS = statsData?.tvs.total || 0;

  const isLoading = isStatsLoading || isStrategiesLoading;

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
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle case where no strategies exist (and not loading)
  if (
    !isLoading &&
    (!allStrategies || allStrategies.length === 0) &&
    (!paginatedStrategies || paginatedStrategies.length === 0)
  ) {
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
    allStrategies.length > 0
      ? allStrategies.reduce((prev, current) => {
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
  // Group strategies below 3% into "Others" for chart readability
  const OTHERS_THRESHOLD = 3;
  const majorStrategies: { name: string; value: number; percentage: number; color: string }[] = [];
  let othersValue = 0;
  let othersPercentage = 0;
  let othersCount = 0;

  allStrategies.forEach((strategy) => {
    if (strategy.tvs_percentage >= OTHERS_THRESHOLD) {
      majorStrategies.push({
        name: strategy.token?.symbol || "Unknown",
        value: strategy.tvs_usd,
        percentage: strategy.tvs_percentage,
        color: stringToColor(strategy.token?.symbol || strategy.strategy_address),
      });
    } else {
      othersValue += strategy.tvs_usd;
      othersPercentage += strategy.tvs_percentage;
      othersCount++;
    }
  });

  const pieChartData = [...majorStrategies];
  if (othersCount > 0) {
    pieChartData.push({
      name: `Others (${othersCount})`,
      value: othersValue,
      percentage: othersPercentage,
      color: "#6B7280",
    });
  }

  const chartColors = pieChartData.map((d) => d.color);

  // Dummy data for gated table
  const DUMMY_STRATEGIES = [
    {
      strategy_id: "dummy-1",
      strategy_name: "Ethereum Beacon Chain",
      strategy_symbol: "beaconETH",
      tvs_usd: 125000000,
      tvs_percentage: 45.2,
      max_magnitude: "48500.5",
      utilization_rate: "0.85",
      delegator_count: 1240,
    },
    {
      strategy_id: "dummy-2",
      strategy_name: "Lido Staked ETH",
      strategy_symbol: "stETH",
      tvs_usd: 85000000,
      tvs_percentage: 30.8,
      max_magnitude: "32000.2",
      utilization_rate: "0.72",
      delegator_count: 850,
    },
    {
      strategy_id: "dummy-3",
      strategy_name: "Rocket Pool ETH",
      strategy_symbol: "rETH",
      tvs_usd: 42000000,
      tvs_percentage: 15.2,
      max_magnitude: "15800.8",
      utilization_rate: "0.91",
      delegator_count: 420,
    },
    {
      strategy_id: "dummy-4",
      strategy_name: "Coinbase Wrapped Staked ETH",
      strategy_symbol: "cbETH",
      tvs_usd: 15000000,
      tvs_percentage: 5.4,
      max_magnitude: "5600.4",
      utilization_rate: "0.64",
      delegator_count: 210,
    },
    {
      strategy_id: "dummy-5",
      strategy_name: "Frax Ether",
      strategy_symbol: "frxETH",
      tvs_usd: 6500000,
      tvs_percentage: 2.3,
      max_magnitude: "2400.2",
      utilization_rate: "0.58",
      delegator_count: 95,
    },
    {
      strategy_id: "dummy-6",
      strategy_name: "Mantle Staked ETH",
      strategy_symbol: "mETH",
      tvs_usd: 3000000,
      tvs_percentage: 1.1,
      max_magnitude: "1100.1",
      utilization_rate: "0.42",
      delegator_count: 45,
    },
  ];

  const tableData = isFree
    ? DUMMY_STRATEGIES
    : paginatedStrategies.map((s: OperatorStrategyListItem) => ({
        ...s,
        id: s.strategy_id,
      }));

  // Pagination Handlers
  const totalPages = Math.ceil(totalStrategiesCount / pageSize);
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Strategies"
          value={totalStrategiesCount}
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
      <ProGate
        isLocked={isFree}
        feature="TVS Distribution"
        description="Unlock visual breakdown of TVS across all strategies, including percentage share and USD value distribution."
      >
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
                centerLabel={totalTVS >= 1_000_000 ? `$${(totalTVS / 1_000_000).toFixed(1)}M` : totalTVS >= 1_000 ? `$${(totalTVS / 1_000).toFixed(1)}K` : `$${totalTVS.toFixed(0)}`}
                centerSubLabel="Total TVS"
              />

              <div className="flex flex-col justify-center space-y-3">
                <h4 className="font-semibold mb-2">Strategy Breakdown</h4>
                {pieChartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium block" style={{ fontVariantNumeric: "tabular-nums" }}>
                        ${item.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground block" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </ProGate>

      {/* Strategies Table */}
      <ProGate
        isLocked={isFree}
        feature="Strategy Details"
        description="Unlock the full strategy table with exact amounts, share percentages, and delegator counts per strategy."
      >
        <div className="space-y-4">
          <ReusableTable
            columns={[
              { key: "token", displayName: "Strategy" },
              { key: "max_magnitude", displayName: "Total Value" },
              { key: "utilization_rate", displayName: "Utilization" },
              { key: "delegator_count", displayName: "Delegators" },
            ]}
            data={tableData.map((s: any) => {
              const utilization = parseFloat(s.utilization_rate || "0");

              return {
                ...s,
                id: s.strategy_id,
                max_magnitude: (
                  <div className="space-y-1">
                    <p className="font-medium">
                      {parseFloat(s.max_magnitude).toLocaleString(undefined, {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 4,
                      })}{" "}
                      {s.strategy_symbol}
                    </p>
                  </div>
                ),
                utilization_rate: (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {(utilization * 100).toFixed(2)}%
                    </span>
                    <Progress value={utilization * 100} className="w-16 h-2" />
                  </div>
                ),
                delegator_count: (
                  <Badge variant="secondary">{s.delegator_count || 0}</Badge>
                ),
                token: (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {s.strategy_symbol?.slice(0, 2) || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {s.strategy_name || "Unknown Strategy"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {s.strategy_symbol}
                      </p>
                    </div>
                  </div>
                ),
              };
            })}
            tableFilters={{ title: "All Strategies" }}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <div className="flex-1 text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalStrategiesCount)} of{" "}
                {totalStrategiesCount} strategies
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePrevPage()}
                    disabled={page <= 1 || isStrategiesLoading}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handleNextPage()}
                    disabled={page >= totalPages || isStrategiesLoading}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ProGate>
    </div>
  );
};

export default StrategiesTab;
