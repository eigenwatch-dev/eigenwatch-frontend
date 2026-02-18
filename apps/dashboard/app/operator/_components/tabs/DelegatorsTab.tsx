/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { SectionContainer } from "@/components/shared/data/SectionContainer";
import { StatCard } from "@/components/shared/data/StatCard";
import ReusableTable from "@/components/shared/table/ReuseableTable";
import { ProGate } from "@/components/shared/ProGate";
import { useProAccess } from "@/hooks/useProAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress, formatUSD } from "@/lib/formatting";
import { useOperatorDelegators } from "@/hooks/crud/useDelegators";
import { useOperatorStats } from "@/hooks/crud/useOperator";

// components/operator/tabs/DelegatorsTab.tsx
interface DelegatorsTabProps {
  operatorId: string;
}

export const DelegatorsTab = ({ operatorId }: DelegatorsTabProps) => {
  const { isFree } = useProAccess();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);

  const { data: delegators, isLoading: isDelegatorsLoading } =
    useOperatorDelegators(operatorId, {
      limit,
      offset,
    });

  const { data: stats, isLoading: isStatsLoading } =
    useOperatorStats(operatorId);

  if (isDelegatorsLoading || isStatsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const delegatorsList = delegators?.delegators || [];
  const total = delegators?.summary?.total_delegators || 0;
  const active = delegators?.summary?.active_delegators || 0;
  const operatorTotalTvs = stats?.tvs?.total || 1; // Avoid division by zero

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title={"Total Delegators"} value={total} />
        <StatCard title={"Active Delegators"} value={active} />
        {/* TODO: Find this metric and add */}
        <StatCard
          title={"Delegation HHI"}
          value={0}
          subtitle={"Low concentration"}
        />
      </div>

      <ProGate
        isLocked={isFree}
        feature="Delegator List"
        description="Unlock the full delegator list — see individual staker addresses, TVS amounts, stake percentages, and delegation history."
      >
      <SectionContainer heading="Delegator List">
        <ReusableTable
          columns={[
            { key: "staker_address", displayName: "Staker Address" },
            { key: "total_tvs", displayName: "TVS (USD)" },
            { key: "shares_percentage", displayName: "% Staked" },
            { key: "strategies_count", displayName: "Strategies" },
            { key: "delegated_at", displayName: "Delegation Date" },
            { key: "status", displayName: "Status" },
          ]}
          data={delegatorsList.map((delegator) => {
            const delegatorTvs = parseFloat(delegator.total_tvs || "0");
            const percentage =
              operatorTotalTvs > 0
                ? (delegatorTvs / operatorTotalTvs) * 100
                : 0;

            return {
              ...delegator,
              staker_address: formatAddress(delegator.staker_address),
              total_tvs: formatUSD(delegatorTvs),
              shares_percentage: `${percentage.toFixed(4)}%`,
              strategies_count: `${delegator.strategies.length} Strategies`,
              delegated_at: new Date(
                delegator.delegated_at,
              ).toLocaleDateString(),
              status: (
                <span
                  className={
                    delegator.is_delegated ? "text-green-500" : "text-red-500"
                  }
                >
                  {delegator.is_delegated ? "Active" : "Inactive"}
                </span>
              ),
            };
          })}
          tableFilters={{ title: "Delegator List" }}
          paginationProps={{
            pagination: {
              total: delegators?.pagination?.total || 0,
              offset,
              limit,
            },
            onOffsetChange: setOffset,
            onLimitChange: (newLimit) => {
              setLimit(newLimit);
              setOffset(0);
            },
            isLoading: isDelegatorsLoading,
          }}
        />
      </SectionContainer>
      </ProGate>
    </div>
  );
};
