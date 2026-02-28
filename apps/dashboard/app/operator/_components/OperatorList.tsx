"use client";

import { useState } from "react";
import Link from "next/link";
import { ListEntityView } from "@/components/shared/ListEntityView";
import { TableColumnConfig } from "@/components/shared/table/ReuseableTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOperators } from "@/hooks/crud/useOperator";
import { useRouter } from "next/navigation";
import { Operator } from "@/types/operator.types";
import { ProGateCell } from "@/components/shared/ProGateCell";
import { useProAccess } from "@/hooks/useProAccess";

const RISK_COLORS: Record<string, string> = {
  low: "text-green-500 bg-green-500/10 border-green-500/20",
  medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  high: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  critical: "text-red-500 bg-red-500/10 border-red-500/20",
};

const RISK_DOT_COLORS: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

function RiskPill({ level }: { level: string }) {
  const key = level.toLowerCase();
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${RISK_COLORS[key] || RISK_COLORS.medium}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${RISK_DOT_COLORS[key] || RISK_DOT_COLORS.medium}`} />
      {key}
    </span>
  );
}

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
  const { isFree } = useProAccess();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useOperators(
    { limit, offset },
    {
      initialData:
        offset === 0
          ? { data: initialData, pagination: initialPagination }
          : undefined,
    },
  );

  const operatorData = data?.data || [];
  const total = data?.pagination?.total || 0;

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
          risk_score: (
            <ProGateCell
              isLocked={isFree}
              feature="Risk Score"
              description="Unlock risk scores to evaluate operator safety before delegating."
            >
              <span className="font-medium tabular-nums">{operator.risk_score ?? "—"}</span>
            </ProGateCell>
          ),
          risk_level: (
            <RiskPill level={operator.risk_level} />
          ),
          operator: (
            <div className="flex gap-[12px]">
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
                <Link
                  href={`/operator/${operator.operator_id}`}
                  className="text-foreground hover:text-blue-400 hover:underline transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {operator.metadata?.name || "Anonymous Op"}
                </Link>
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
