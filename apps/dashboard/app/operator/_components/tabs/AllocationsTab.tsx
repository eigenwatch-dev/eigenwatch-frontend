"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SectionContainer } from "@/components/shared/data/SectionContainer";
import { StatCard } from "@/components/shared/data/StatCard";
import { UtilizationBadge } from "@/components/shared/data/UtilizationBadge";
import { RiskIndicators } from "@/components/shared/data/RiskIndicators";
import ReusableTable from "@/components/shared/table/ReuseableTable";
import { ProGate } from "@/components/shared/ProGate";
import { useProAccess } from "@/hooks/useProAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAllocationsOverview } from "@/hooks/crud/useAllocation";
import { formatUSD } from "@/lib/formatting";
import { EDUCATIONAL_TOOLTIPS } from "@/lib/educational-content";
import { Layers, PieChart, Shield, TrendingUp } from "lucide-react";
import type {
  AllocationByAVS,
  AllocationByStrategy,
} from "@/types/allocation.types";

interface AllocationsTabProps {
  operatorId: string;
}

export const AllocationsTab = ({ operatorId }: AllocationsTabProps) => {
  const { isFree } = useProAccess();
  const [allocOffset, setAllocOffset] = useState(0);
  const [allocLimit, setAllocLimit] = useState(10);
  const { data: allocations, isLoading } = useAllocationsOverview(operatorId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract summary data (handle both enhanced and legacy formats)
  const summary = allocations?.summary;
  const totalAllocatedUsd = summary?.total_allocated_usd || "0";
  const totalTvsUsd = summary?.total_tvs_usd || "0";
  const utilizationPct = summary?.overall_utilization_pct || "0";
  const avsCount = summary?.total_avs_count || allocations?.by_avs?.length || 0;
  const operatorSetCount = summary?.total_operator_set_count || 0;

  // Format strategy data for display
  const strategyData = (allocations?.by_strategy || []).map(
    (strategy: AllocationByStrategy) => ({
      strategy_name:
        strategy.strategy_symbol || strategy.strategyName || "Unknown",
      tvs_usd: strategy.tvs_usd ? formatUSD(strategy.tvs_usd) : "—",
      allocated_usd: strategy.allocated_usd
        ? formatUSD(strategy.allocated_usd)
        : "—",
      utilization: strategy.utilization_pct || "0",
      avs_count: strategy.avs_count || strategy.avsCount || 0,
    }),
  );

  // Format AVS data for display
  const avsData = (allocations?.by_avs || []).map((avs: AllocationByAVS) => ({
    avs_name: (
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          {avs.avs_logo && <AvatarImage src={avs.avs_logo} alt={avs.avs_name || avs.avsName || "AVS"} />}
          <AvatarFallback className="text-[10px]">
            {(avs.avs_name || avs.avsName || "?").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>{avs.avs_name || avs.avsName || "Unknown AVS"}</span>
      </div>
    ),
    allocated_usd: avs.total_allocated_usd
      ? formatUSD(avs.total_allocated_usd)
      : "—",
    share_pct: avs.allocation_share_pct ? `${avs.allocation_share_pct}%` : "—",
    operator_sets: avs.operator_set_count || avs.operator_sets || 0,
    strategies: avs.strategies || (avs.strategies_used?.length ?? 0),
  }));

  const DUMMY_AVS_ALLOCATIONS = Array.from({ length: 6 }).map((_, i) => ({
    avs_name: [
      "EigenDA",
      "AltLayer",
      "Brevis",
      "Eoracle",
      "Lagrange",
      "WitnessChain",
    ][i],
    allocated_usd: formatUSD(5000000 - i * 800000),
    share_pct: `${(25 - i * 3).toFixed(1)}%`,
    operator_sets: 2,
    strategies: 3,
  }));

  const paginatedAvsData = avsData.slice(allocOffset, allocOffset + allocLimit);
  const displayAvsData = isFree ? DUMMY_AVS_ALLOCATIONS : paginatedAvsData;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Allocated"
          value={formatUSD(totalAllocatedUsd)}
          icon={<Layers className="h-5 w-5" />}
          tooltip={EDUCATIONAL_TOOLTIPS.allocatedUsd.detailed}
        />
        <StatCard
          title="Utilization"
          value={
            <div className="flex items-center gap-2">
              <span>{parseFloat(utilizationPct).toFixed(1)}%</span>
              <UtilizationBadge pct={utilizationPct} size="sm" />
            </div>
          }
          icon={<PieChart className="h-5 w-5" />}
          tooltip={EDUCATIONAL_TOOLTIPS.utilization.detailed}
        />
        <StatCard
          title="Active AVSs"
          value={avsCount}
          icon={<Shield className="h-5 w-5" />}
          tooltip={EDUCATIONAL_TOOLTIPS.avs.detailed}
        />
        <StatCard
          title="Operator Sets"
          value={operatorSetCount}
          icon={<TrendingUp className="h-5 w-5" />}
          tooltip={EDUCATIONAL_TOOLTIPS.operatorSet.detailed}
        />
      </div>

      {/* Strategy Utilization + Allocations by AVS + Risk Indicators (Pro) */}
      <ProGate
        isLocked={isFree}
        feature="Allocation Details"
        description="Unlock strategy utilization breakdowns, per-AVS allocations, and risk indicators to understand where capital is deployed and exposure concentrates."
      >
        {/* Strategy Utilization */}
        {strategyData.length > 0 && (
          <SectionContainer
            heading="Strategy Utilization"
            info="Shows how much of each strategy's capacity is allocated to AVSs. Higher utilization means more of the strategy is being used."
          >
            <div className="space-y-4">
              {strategyData.map((strategy, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {strategy.strategy_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {strategy.avs_count} AVS
                        {strategy.avs_count !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Allocated:{" "}
                        <span className="text-foreground">
                          {strategy.allocated_usd}
                        </span>
                      </span>
                      <UtilizationBadge pct={strategy.utilization} size="sm" />
                    </div>
                  </div>
                  <Progress
                    value={parseFloat(strategy.utilization) || 0}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </SectionContainer>
        )}

        {/* Allocations by AVS */}
        <SectionContainer
          heading="Allocations by AVS"
          info="Breakdown of how much value is allocated to each AVS network. Shows where the operator's stake is being used."
        >
          {displayAvsData.length > 0 ? (
            <ReusableTable
              columns={[
                { key: "avs_name", displayName: "AVS" },
                { key: "allocated_usd", displayName: "Allocated (USD)" },
                { key: "share_pct", displayName: "Share %" },
                { key: "operator_sets", displayName: "Operator Sets" },
                { key: "strategies", displayName: "Strategies" },
              ]}
              data={displayAvsData}
              tableFilters={{ title: "Allocations by AVS" }}
              paginationProps={
                isFree
                  ? undefined
                  : {
                      pagination: {
                        total: avsData.length,
                        offset: allocOffset,
                        limit: allocLimit,
                      },
                      onOffsetChange: setAllocOffset,
                      onLimitChange: (newLimit) => {
                        setAllocLimit(newLimit);
                        setAllocOffset(0);
                      },
                      isLoading,
                    }
              }
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No allocations found</p>
              <p className="text-sm mt-1">
                This operator has not allocated to any AVS yet.
              </p>
            </div>
          )}
        </SectionContainer>

        {/* Risk Indicators */}
        {allocations?.risk_metrics && (
          <RiskIndicators metrics={allocations.risk_metrics} />
        )}
      </ProGate>

      {/* Educational Note */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Understanding Allocations
        </h4>
        <p className="text-sm text-muted-foreground">
          Allocations represent how much of an operator&apos;s stake is
          committed to secure different AVS networks. Higher utilization means
          more of the operator&apos;s capacity is being used. The values shown
          are in USD for easier comparison across different strategies and
          assets.
        </p>
      </div>
    </div>
  );
};
