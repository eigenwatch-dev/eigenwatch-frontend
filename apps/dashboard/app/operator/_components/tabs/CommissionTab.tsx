import { SectionContainer } from "@/components/shared/data/SectionContainer";
import { StatCard } from "@/components/shared/data/StatCard";
import ReusableTable from "@/components/shared/table/ReuseableTable";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { formatDistanceToNow } from "date-fns";

interface CommissionTabProps {
  operatorId: string;
}

export const CommissionTab = ({ operatorId }: CommissionTabProps) => {
  const { data: commission, isLoading } = useOperatorCommission(operatorId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const piCommission = commission?.pi_commission || 0;
  const benchmarks = commission?.network_benchmarks;
  const tier = getCommissionTier(piCommission, benchmarks);
  const tierDisplay = getTierDisplay(tier);

  // Debug: Log the raw commission data to see format
  console.log("[CommissionTab] Raw data:", {
    commission,
    piCommission,
    benchmarks,
  });

  // Build tooltip text
  const percent = (piCommission / 100).toFixed(2);
  const tooltipText = `This operator takes ${percent}% of your earned rewards. On a 5% APY, for every $1,000 staked, you'd pay ~$${((1000 * 0.05 * piCommission) / 10000).toFixed(2)}/year.`;

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

  return (
    <div className="space-y-4">
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
                      Network median:{" "}
                      {formatCommission(benchmarks.median_pi_commission_bips)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        }
        subtitle="Standard commission applied across all AVS"
        tooltip={tooltipText}
      />

      <SectionContainer heading="Per-AVS Commissions">
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
      </SectionContainer>
    </div>
  );
};
