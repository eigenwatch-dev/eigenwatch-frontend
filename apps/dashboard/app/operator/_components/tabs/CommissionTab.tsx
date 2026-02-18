"use client";

import { SectionContainer } from "@/components/shared/data/SectionContainer";
import { StatCard } from "@/components/shared/data/StatCard";
import ReusableTable from "@/components/shared/table/ReuseableTable";
import { ProGate } from "@/components/shared/ProGate";
import { useProAccess } from "@/hooks/useProAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOperatorCommission } from "@/hooks/crud/commission";
import {
  formatCommission,
  getCommissionTier,
  getTierDisplay,
} from "@/lib/commission.utils";
import { EDUCATIONAL_TOOLTIPS } from "@/lib/educational-content";
import { formatDistanceToNow } from "date-fns";
import {
  Percent,
  TrendingDown,
  TrendingUp,
  Scale,
  DollarSign,
} from "lucide-react";

interface CommissionTabProps {
  operatorId: string;
}

export const CommissionTab = ({ operatorId }: CommissionTabProps) => {
  const { isFree } = useProAccess();
  const { data: commission, isLoading } = useOperatorCommission(operatorId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const piCommission = commission?.pi_commission || 0;
  const benchmarks = commission?.network_benchmarks;
  const tier = getCommissionTier(piCommission, benchmarks);
  const tierDisplay = getTierDisplay(tier);

  // Build tooltip text
  const percent = (piCommission / 100).toFixed(2);
  const tooltipText = `This operator takes ${percent}% of your earned rewards. On a 5% APY, for every $1,000 staked, you'd pay ~$${((1000 * 0.05 * piCommission) / 10000).toFixed(2)}/year.`;

  // Calculate annual cost example
  const annualCostPer1000 = ((1000 * 0.05 * piCommission) / 10000).toFixed(2);

  // Format AVS data for table
  const avsTableData = (commission?.avs_commissions || []).map((avs) => ({
    avs_name: avs.avs_name,
    commission_rate: formatCommission(avs.current_bips),
    stability:
      avs.total_changes === 0 ? "Stable" : `${avs.total_changes} changes`,
    rate_age: avs.first_set_at
      ? formatDistanceToNow(new Date(avs.first_set_at), { addSuffix: false })
      : "—",
    pending: avs.upcoming_bips
      ? `${formatCommission(avs.upcoming_bips)} on ${avs.upcoming_activated_at ? new Date(avs.upcoming_activated_at).toLocaleDateString() : "TBD"}`
      : null,
  }));

  // Calculate comparison to median
  const medianCommission = benchmarks?.median_pi_commission_bips || 0;
  const comparisonToMedian =
    medianCommission > 0
      ? (((piCommission - medianCommission) / medianCommission) * 100).toFixed(
          1,
        )
      : 0;
  const isAboveMedian = piCommission > medianCommission;

  return (
    <div className="space-y-6">
      {/* Main Commission Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Protocol-wide Commission (PI)"
          value={
            <div className="flex items-center gap-2">
              <span>{formatCommission(piCommission)}</span>
              {benchmarks && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className={`${tierDisplay.color} cursor-help`}
                      >
                        {tierDisplay.emoji} {tierDisplay.label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{tooltipText}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Network median: {formatCommission(medianCommission)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          }
          subtitle="Standard commission applied across all AVS"
          icon={<Percent className="h-5 w-5" />}
          tooltip={EDUCATIONAL_TOOLTIPS.piCommission.detailed}
        />

        <StatCard
          title="vs Network Median"
          value={
            <div className="flex items-center gap-2">
              {isAboveMedian ? (
                <TrendingUp className="h-5 w-5 text-orange-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-500" />
              )}
              <span
                className={isAboveMedian ? "text-orange-500" : "text-green-500"}
              >
                {isAboveMedian ? "+" : ""}
                {comparisonToMedian}%
              </span>
            </div>
          }
          subtitle={`Median: ${formatCommission(medianCommission)}`}
          icon={<Scale className="h-5 w-5" />}
          tooltip="How this operator's commission compares to the network median. Lower is better for delegators."
        />

        <StatCard
          title="Est. Annual Cost"
          value={`$${annualCostPer1000}`}
          subtitle="Per $1,000 staked (5% APY)"
          icon={<DollarSign className="h-5 w-5" />}
          tooltip="Estimated annual commission cost based on $1,000 staked and an average 5% APY. Actual costs depend on rewards earned."
        />
      </div>

      {/* Commission Visualization & Per-AVS Commissions (Pro) */}
      <ProGate
        isLocked={isFree}
        feature="Commission Behavior"
        description="Unlock commission comparison charts, per-AVS commission breakdowns, and rate stability analysis to assess economic risk."
      >
        {/* Commission Visualization */}
        {benchmarks && (
          <SectionContainer
            heading="Commission Comparison"
            info="Visual comparison of this operator's commission relative to network benchmarks"
          >
            <div className="space-y-4">
              {/* PI Commission Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This Operator</span>
                  <span className="font-medium">
                    {formatCommission(piCommission)}
                  </span>
                </div>
                <Progress
                  value={Math.min(piCommission / 100, 100)}
                  className="h-3"
                />
              </div>

              {/* Network Benchmarks */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">25th Pctl</p>
                  <p className="font-medium">
                    {formatCommission(benchmarks.p25_pi_commission_bips || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Median</p>
                  <p className="font-medium">
                    {formatCommission(benchmarks.median_pi_commission_bips || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">75th Pctl</p>
                  <p className="font-medium">
                    {formatCommission(benchmarks.p75_pi_commission_bips || 0)}
                  </p>
                </div>
              </div>
            </div>
          </SectionContainer>
        )}

        {/* Per-AVS Commissions */}
        <SectionContainer
          heading="Per-AVS Commissions"
          info="Commission rates may vary by AVS. Some AVS networks set their own commission rates that override the operator's default PI commission."
        >
          {avsTableData.length > 0 ? (
            <ReusableTable
              columns={[
                { key: "avs_name", displayName: "AVS" },
                { key: "commission_rate", displayName: "Commission Rate" },
                { key: "stability", displayName: "Stability" },
                { key: "rate_age", displayName: "Rate Age" },
              ]}
              data={avsTableData}
              tableFilters={{ title: "Per-AVS Commissions" }}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Percent className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No AVS-specific commissions found</p>
              <p className="text-sm mt-1">
                The PI commission applies to all AVS registrations.
              </p>
            </div>
          )}
        </SectionContainer>
      </ProGate>

      {/* Educational Note */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Understanding Commission
        </h4>
        <p className="text-sm text-muted-foreground mb-2">
          {EDUCATIONAL_TOOLTIPS.commission.detailed}
        </p>
        <p className="text-sm text-muted-foreground">
          Commission hierarchy: <strong>Operator Set</strong> &gt;{" "}
          <strong>AVS</strong> &gt; <strong>PI (Protocol-wide)</strong>. If an
          AVS or Operator Set has a specific rate, it overrides the PI
          commission.
        </p>
      </div>
    </div>
  );
};
