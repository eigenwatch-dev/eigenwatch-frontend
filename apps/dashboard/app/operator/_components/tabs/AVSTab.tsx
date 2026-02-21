"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, CheckCircle2, Clock, Layers } from "lucide-react";
import { StatCard } from "@/components/shared/data/StatCard";
import { SectionContainer } from "@/components/shared/data/SectionContainer";
import ReusableTable from "@/components/shared/table/ReuseableTable";
import { ProGate } from "@/components/shared/ProGate";
import { useProAccess } from "@/hooks/useProAccess";
import { EDUCATIONAL_TOOLTIPS } from "@/lib/educational-content";
import { formatUSD } from "@/lib/formatting";
import { useOperatorAVS } from "@/hooks/crud/useAvs";

interface AVSTabProps {
  operatorId: string;
}

interface AVSRelationship {
  avs_id?: string;
  avs_name?: string;
  avs_logo?: string | null;
  status?: string;
  days_registered?: number;
  operator_set_count?: number;
  operator_sets?: number;
  total_allocated_usd?: string;
  effective_commission_bips?: number;
  effective_commission_pct?: string;
  commission?: number;
  commissions?: string;
}

export const AVSTab = ({ operatorId }: AVSTabProps) => {
  const { isFree } = useProAccess();
  const { data: avsData, isLoading } = useOperatorAVS(operatorId);
  const avsList: AVSRelationship[] = avsData?.avs_relationships || [];

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
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate metrics
  const registeredCount = avsList.filter(
    (avs) => avs.status === "registered",
  ).length;
  const totalAllocatedUsd = avsList.reduce(
    (sum, avs) => sum + parseFloat(avs.total_allocated_usd || "0"),
    0,
  );
  const avgCommission =
    avsList.length > 0
      ? avsList.reduce(
          (s, a) => s + (a.effective_commission_bips || a.commission || 0),
          0,
        ) /
        avsList.length /
        100
      : 0;
  const totalOperatorSets = avsList.reduce(
    (sum, avs) => sum + (avs.operator_set_count || avs.operator_sets || 0),
    0,
  );

  // Format table data
  const tableData = avsList.map((avs) => ({
    avs_name: avs.avs_name || "Unknown AVS",
    status: avs.status || "unknown",
    days_registered: avs.days_registered || 0,
    operator_sets: avs.operator_set_count || avs.operator_sets || 0,
    allocated_usd: avs.total_allocated_usd
      ? formatUSD(avs.total_allocated_usd)
      : "—",
    commission: avs.effective_commission_pct
      ? `${avs.effective_commission_pct}%`
      : avs.effective_commission_bips
        ? `${(avs.effective_commission_bips / 100).toFixed(2)}%`
        : avs.commissions || "—",
  }));

  const DUMMY_AVS_LIST = Array.from({ length: 6 }).map((_, i) => ({
    avs_name: [
      "EigenDA",
      "AltLayer",
      "Brevis",
      "Eoracle",
      "Lagrange",
      "WitnessChain",
    ][i],
    status: "registered",
    days_registered: 120 - i * 15,
    operator_sets: 2,
    allocated_usd: formatUSD(5000000 - i * 800000),
    commission: `${(10 - i * 1).toFixed(2)}%`,
  }));

  const displayTableData = isFree ? DUMMY_AVS_LIST : tableData;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total AVSs"
          value={avsList.length}
          icon={<Shield className="h-5 w-5" />}
          tooltip={EDUCATIONAL_TOOLTIPS.avs.detailed}
        />
        <StatCard
          title="Active Registrations"
          value={registeredCount}
          subtitle={
            avsList.length > 0
              ? `${((registeredCount / avsList.length) * 100).toFixed(0)}% active`
              : undefined
          }
          icon={<CheckCircle2 className="h-5 w-5" />}
          tooltip="Number of AVS registrations that are currently active and earning rewards"
        />
        <StatCard
          title="Total Allocated"
          value={formatUSD(totalAllocatedUsd)}
          icon={<Layers className="h-5 w-5" />}
          tooltip="Total USD value allocated across all AVS networks"
        />
        <StatCard
          title="Avg Commission"
          value={`${avgCommission.toFixed(2)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          tooltip="Average commission rate across all AVS registrations"
        />
      </div>

      {/* AVS Relationships Table */}
      <ProGate
        isLocked={isFree}
        feature="AVS Relationships"
        description="Unlock the full AVS relationship table — see allocations, commissions, and operator sets per AVS to understand exposure and dependency risk."
      >
        <SectionContainer
          heading="AVS Relationships"
          info="List of all AVS networks this operator is registered with. Each AVS may have different commission rates and allocation amounts."
        >
          {displayTableData.length > 0 ? (
            <ReusableTable
              columns={[
                { key: "avs_name", displayName: "AVS Name" },
                {
                  key: "status",
                  displayName: "Status",
                },
                { key: "days_registered", displayName: "Days Active" },
                { key: "operator_sets", displayName: "Operator Sets" },
                { key: "allocated_usd", displayName: "Allocated (USD)" },
                { key: "commission", displayName: "Commission" },
              ]}
              data={displayTableData}
              tableFilters={{ title: "AVS Relationships" }}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No AVS registrations found</p>
              <p className="text-sm mt-1">
                This operator is not registered with any AVS yet.
              </p>
            </div>
          )}
        </SectionContainer>

        {/* Summary Stats */}
        {avsList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Operator Sets</span>
              </div>
              <p className="text-2xl font-semibold">{totalOperatorSets}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Across {avsList.length} AVS{avsList.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Registration Status</span>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="text-green-500 bg-green-500/10"
                >
                  {registeredCount} Active
                </Badge>
                {avsList.length - registeredCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-yellow-500 bg-yellow-500/10"
                  >
                    {avsList.length - registeredCount} Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </ProGate>

      {/* Educational Note */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Understanding AVS Relationships
        </h4>
        <p className="text-sm text-muted-foreground">
          AVS (Actively Validated Services) are protocols that use EigenLayer
          for security. Operators register with AVSs to provide validation
          services. Each registration may have different commission rates - some
          set by the operator (PI commission) and some specific to the AVS or
          operator set.
        </p>
      </div>
    </div>
  );
};
