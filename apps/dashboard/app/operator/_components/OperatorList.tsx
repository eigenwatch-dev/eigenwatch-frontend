"use client";

import { useState } from "react";
import { ListEntityView } from "@/components/shared/ListEntityView";
import { TableColumnConfig } from "@/components/shared/table/ReuseableTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOperators } from "@/hooks/crud/useOperator";
import { useRouter } from "next/navigation";
import { Operator } from "@/types/operator.types";

interface OperatorListProps {
  initialData: Operator[];
  initialPagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
    next_offset: number;
  };
}

export function OperatorList({
  initialData,
  initialPagination,
}: OperatorListProps) {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useOperators({
    limit,
    offset,
  });

  // Use server-fetched data for initial render, React Query data for subsequent
  const operatorData = data?.data || initialData;
  const total = data?.pagination?.total || initialPagination?.total || 0;

  const operatorsColumns: TableColumnConfig[] = [
    { key: "operator", displayName: "Operator" },
    { key: "risk_level", displayName: "Risk Level" },
    { key: "risk_score", displayName: "Risk Score" },
    { key: "active_avs_count", displayName: "Active AVS" },
    { key: "delegator_count", displayName: "Delegator Count" },
    { key: "operational_days", displayName: "Operational Days" },
  ];

  return (
    <ListEntityView
      entity="Operators"
      searchPlaceholder="Search operators by name, ID, or address..."
      tableConfig={{
        columns: operatorsColumns,
        data: operatorData.map((operator) => ({
          ...operator,
          risk_level: (
            <button
              className={
                "flex py-[3px] w-[75px] rounded-[8px] " +
                (operator.risk_level.toLowerCase() === "medium"
                  ? "bg-blue-800/10"
                  : operator.risk_level.toLowerCase() === "low"
                  ? "bg-green-800/10"
                  : "bg-red-800/10")
              }
            >
              <span
                className={
                  "capitalize text-[12px] flex mx-auto " +
                  (operator.risk_level.toLowerCase() === "medium"
                    ? "text-blue-500"
                    : operator.risk_level.toLowerCase() === "low"
                    ? "text-green-500"
                    : "text-red-500")
                }
              >
                {operator.risk_level.toLowerCase()}
              </span>
            </button>
          ),
          operator: (
            <div className="flex gap-[12px] ">
              <Avatar className="w-[32px] h-[32px] rounded-[10px]">
                <AvatarImage
                  src={operator?.metadata?.logo}
                  alt={operator?.metadata?.name + " Logo"}
                />
                <AvatarFallback className="w-[32px] h-[32px] rounded-[10px] bg-blue-800/10">
                  {(operator.metadata?.name || "Anonymous Op").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex my-auto">
                <span>{operator.metadata?.name || "Anonymous Op"}</span>
              </div>
            </div>
          ),
        })),
        onRowClick: (row) => {
          router.push(`/operator/${row.operator_id}`);
        },
        paginationProps: {
          pagination: {
            total,
            offset,
            limit,
          },
          onOffsetChange: setOffset,
          onLimitChange: (newLimit) => {
            setLimit(newLimit);
            setOffset(0);
          },
          isLoading,
        },
      }}
    />
  );
}
