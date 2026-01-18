"use client";

import { mockOperators } from "@/constants";
import { Operator } from "@/types";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface OperatorsTableProps {
  query: string;
  hideInactive: boolean;
}

export default function OperatorsTable({
  query,
  hideInactive,
}: OperatorsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Operator;
    direction: "asc" | "desc";
  } | null>(null);
  const ITEMS_PER_PAGE = 10;

  // Helper to parse values for sorting
  const parseValue = (value: string, key: keyof Operator) => {
    if (key === "riskLevel") {
      const levels = { Low: 1, Medium: 2, High: 3 };
      return levels[value as keyof typeof levels] || 0;
    }
    if (typeof value === "string") {
      // Remove commas and other non-numeric chars if it looks like a number
      const cleanValue = value
        .replace(/,/g, "")
        .replace(/%/g, "")
        .replace(/ ETH/g, "")
        .replace(/ people/g, "");
      if (!isNaN(Number(cleanValue)) && cleanValue !== "") {
        return Number(cleanValue);
      }
    }
    return value;
  };

  const filteredOperators = mockOperators.filter((op: Operator) => {
    const matchesQuery =
      op.name.toLowerCase().includes(query.toLowerCase()) ||
      op.id.toLowerCase().includes(query.toLowerCase());
    const matchesActive = hideInactive ? op.isActive : true;
    return matchesQuery && matchesActive;
  });

  const sortedOperators = [...filteredOperators].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aValue = parseValue(a[key] as string, key);
    const bValue = parseValue(b[key] as string, key);

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedOperators.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = sortedOperators.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: keyof Operator) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Operator }) => {
    if (sortConfig?.key !== columnKey)
      return <ArrowUpDown size={14} className="opacity-50" />;
    return (
      <ArrowUpDown
        size={14}
        className={`transform transition-transform ${
          sortConfig.direction === "asc" ? "rotate-0" : "rotate-180"
        }`}
      />
    );
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[#71717A] border-b border-[#27272A80]">
              <th
                className="p-4 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  Operators <SortIcon columnKey="name" />
                </div>
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("riskLevel")}
              >
                <div className="flex items-center gap-2">
                  Risk Level <SortIcon columnKey="riskLevel" />
                </div>
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("totalStake")}
              >
                <div className="flex items-center gap-2">
                  Total Stake <SortIcon columnKey="totalStake" />
                </div>
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("performanceScore")}
              >
                <div className="flex items-center gap-2">
                  Performance Score <SortIcon columnKey="performanceScore" />
                </div>
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("delegatorCount")}
              >
                <div className="flex items-center gap-2">
                  Delegator Count <SortIcon columnKey="delegatorCount" />
                </div>
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("operationalDays")}
              >
                <div className="flex items-center gap-2">
                  Operational Days <SortIcon columnKey="operationalDays" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A80]">
            {currentData.length > 0 ? (
              currentData.map((op) => (
                <tr
                  key={op.id}
                  className="text-white hover:bg-[#27272A40] transition-colors group"
                >
                  <td className="p-4">
                    <Link
                      href={`/operator/${op.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                        <Image
                          src={op.icon}
                          alt="Operator icon"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium group-hover:text-[#155DFC] transition-colors">
                          {op.name}
                        </span>
                        {!op.isActive && (
                          <span className="text-[10px] text-[#FF3B30]">
                            Inactive
                          </span>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium
                        ${
                          op.riskLevel === "Low"
                            ? "bg-[#032E15] text-[#00C950]"
                            : op.riskLevel === "Medium"
                              ? "bg-[#461901] text-[#FE9A00]"
                              : "bg-[#460808] text-[#FF3B30]"
                        }`}
                    >
                      {op.riskLevel}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{op.totalStake}</td>
                  <td className="p-4 font-medium">{op.performanceScore}%</td>
                  <td className="p-4 text-[#A1A1AA]">{op.delegatorCount}</td>
                  <td className="p-4 text-[#A1A1AA]">{op.operationalDays}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#71717A]">
                  No operators found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 text-sm mb-6">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-[#155DFC] text-white font-medium"
                  : "text-[#71717A] hover:text-white hover:bg-[#27272A]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
