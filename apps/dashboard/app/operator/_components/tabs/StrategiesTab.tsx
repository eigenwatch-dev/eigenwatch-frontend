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
  const pieChartData = allStrategies.map((strategy) => ({
    name: strategy.token?.symbol || "Unknown",
    value: strategy.tvs_usd,
    percentage: strategy.tvs_percentage,
    color: stringToColor(strategy.token?.symbol || strategy.strategy_address),
  }));

  const chartColors = pieChartData.map((d) => d.color);

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
        <div className="space-y-4">
          <ReusableTable
            columns={[
              { key: "token", displayName: "Strategy" },
              { key: "max_magnitude", displayName: "Total Value" },
              { key: "utilization_rate", displayName: "Utilization" },
              { key: "delegator_count", displayName: "Delegators" },
            ]}
            data={paginatedStrategies.map((s: OperatorStrategyListItem) => {
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
