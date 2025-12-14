/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { SectionContainer } from "@/components/shared/data/SectionContainer";
import { StatCard } from "@/components/shared/data/StatCard";
import ReusableTable from "@/components/shared/table/ReuseableTable";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress, formatEther } from "@/lib/formatting";
import { useOperatorDelegators } from "@/hooks/crud/useDelegators";

// components/operator/tabs/DelegatorsTab.tsx
interface DelegatorsTabProps {
  operatorId: string;
}

export const DelegatorsTab = ({ operatorId }: DelegatorsTabProps) => {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);

  const { data: delegators, isLoading } = useOperatorDelegators(operatorId, {
    limit,
    offset,
  });
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  console.log({ delegators });

  const delegatorsList = delegators?.delegators || [];
  const total = delegators?.summary?.total_delegators || 0;
  const active = delegators?.summary?.active_delegators || 0;

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

      <SectionContainer heading="Delegator List">
        <ReusableTable
          columns={[
            { key: "staker_address", displayName: "Staker Address" },
            { key: "total_shares", displayName: "Shares" },
            { key: "shares_percentage", displayName: "Share %" },
            { key: "strategies_count", displayName: "Strategies" },
            { key: "delegated_at", displayName: "Delegation Date" },
            { key: "status", displayName: "Status" },
          ]}
          data={delegatorsList.map((delegator) => ({
            ...delegator,
            staker_address: formatAddress(delegator.staker_address),
            total_shares: formatEther(delegator.total_shares),
            shares_percentage: `${parseFloat(delegator.shares_percentage).toFixed(2)}%`,
            strategies_count: `${delegator.strategies.length} Strategies`,
            delegated_at: new Date(delegator.delegated_at).toLocaleDateString(),
            status: (
              <span
                className={
                  delegator.is_delegated ? "text-green-500" : "text-red-500"
                }
              >
                {delegator.is_delegated ? "Active" : "Inactive"}
              </span>
            ),
          }))}
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
            isLoading,
          }}
        />
      </SectionContainer>
    </div>
  );
};
