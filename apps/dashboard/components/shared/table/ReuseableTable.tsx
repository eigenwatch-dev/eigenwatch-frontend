/* eslint-disable @typescript-eslint/no-explicit-any */
// components/table/ReusableTable.tsx
"use client";
import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import ClipLoader from "react-spinners/ClipLoader";
import { useTableTabs } from "./hooks/useTableTabs";
import Pagination, { PaginationProps } from "./components/Pagination";
import TableFilters, { TableFiltersProps } from "./components/TableFilters";
import { Checkbox } from "@/components/ui/checkbox";
import useSelectionStore from "@/hooks/store/useSelect";
import { useBreakpoint } from "@/hooks/ui/useBreakpoints";
import { useMobileCardData } from "./components/useMobileCardData";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import BodySix from "@/components/typography/BodySix";
import { ChevronRight } from "lucide-react";

export interface TableColumnConfig {
  key: string;
  displayName: string;
}

export type ReusableTableProps = {
  columns: TableColumnConfig[];
  data: Record<string, any>[];
  tableFilters: TableFiltersProps;
  idKey?: string;
  tableKey?: string;
  paginationProps?: PaginationProps;
  enableMultiSelect?: boolean;
  rawData?: Record<string, any>[][];
  onRowClick?: (row: any) => void;
  altTabs?: ReusableTableProps[];
};

const ReusableTable = ({
  columns: userColumns,
  data,
  idKey = "id",
  tableKey = "default-table",
  paginationProps,
  tableFilters,
  enableMultiSelect,
  altTabs = [],
  onRowClick,
  rawData,
}: ReusableTableProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const { isMaxMd } = useBreakpoint();
  const { currentTab, allTabs } = useTableTabs({
    userColumns,
    data,
    idKey,
    tableKey,
    paginationProps,
    tableFilters,
    enableMultiSelect,
    onRowClick,
    rawData,
    altTabs,
    activeTab,
  });

  const { toggleSelection, isSelected, selectAll, deselectAll } =
    useSelectionStore();

  const visibleIds = useMemo(
    () => currentTab.data.map((row) => row[currentTab.idKey]),
    [currentTab.data, currentTab.idKey]
  );

  const allSelected = visibleIds.every((id) =>
    isSelected(currentTab.tableKey, id)
  );

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const columns = useMemo(() => {
    const handleHeaderToggle = () => {
      if (allSelected) {
        deselectAll(currentTab.tableKey, visibleIds);
      } else {
        selectAll(currentTab.tableKey, visibleIds);
      }
    };

    const formattedColumns = [
      // Selection column
      ...(currentTab.enableMultiSelect
        ? [
            {
              id: "select",
              header: () => (
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleHeaderToggle}
                />
              ),
              cell: ({ row }: { row: any }) => {
                const id = row.original[currentTab.idKey];
                return (
                  <Checkbox
                    checked={isSelected(currentTab.tableKey, id)}
                    onCheckedChange={() => {
                      toggleSelection(currentTab.tableKey, id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                );
              },
              enableSorting: false,
            },
          ]
        : []),

      // User defined columns
      ...currentTab.columns.map((col) => ({
        accessorKey: col.key,
        header: () => col.displayName,
        cell: (info: { getValue: () => any }) => info.getValue(),
      })),
    ];

    return formattedColumns;
  }, [
    currentTab.enableMultiSelect,
    currentTab.columns,
    currentTab.tableKey,
    currentTab.idKey,
    allSelected,
    deselectAll,
    visibleIds,
    selectAll,
    isSelected,
    toggleSelection,
  ]);

  const table = useReactTable({
    data: currentTab.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const mobileCards = useMobileCardData({
    data: currentTab.data,
    columns: currentTab.columns,
    titleKey: currentTab.columns[0]?.key,
    subtitleKey: currentTab.columns[1]?.key,
  });

  return (
    <div className="w-full flex flex-col rounded-[8.3px] mb-[40px]">
      <TableFilters
        {...currentTab.tableFilters}
        tabs={allTabs.map((tab) => tab.tableFilters)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {isMaxMd ? (
        <>
          {/* Mobile Table */}
          <div className="flex flex-col gap-[24px]">
            {mobileCards.map((mobileCard, index) => {
              return (
                <div key={index} className="flex flex-col gap-[24px]">
                  {/* mobile card */}
                  <div
                    className="flex flex-col gap-[13px] relative cursor-pointer hover:bg-muted/50 p-4 rounded-lg transition-colors"
                    onClick={() => handleRowClick(mobileCard.raw)}
                  >
                    {/* Row fields */}
                    {mobileCard.fields.map((field, idx) => (
                      <div className="flex w-full justify-between" key={idx}>
                        <BodySix className="text-muted-foreground font-[500]">
                          {field.label}
                        </BodySix>
                        <BodySix className="text-foreground">
                          {field.value}
                        </BodySix>
                      </div>
                    ))}
                  </div>

                  {/* Conditional separator */}
                  {index < mobileCards.length - 1 && (
                    <Separator color="#E8E9EA" />
                  )}
                </div>
              );
            })}
            {currentTab.tableFilters.addCta && (
              <div className="flex justify-end mt-[10px] mb-[20px]">
                <Button
                  onClick={currentTab.tableFilters.onCtaClick}
                  className="flex items-center gap-[10px] rounded-[30px] px-[18px] py-[8px] bg-primary hover:bg-primary/90 relative top-[10px]"
                >
                  {currentTab.tableFilters.ctaLogo}
                  <BodySix>
                    {currentTab.tableFilters.ctaLabel || "Create New"}
                  </BodySix>
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="w-full overflow-x-auto border rounded-[14px] border-border">
            <table className="w-full">
              <thead className="bg-muted/70">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-border h-[52px]"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left h-[48px] px-[24px] py-[16px] whitespace-nowrap min-w-[100px]"
                      >
                        <span className="text-muted-foreground font-[600] text-[14px]">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                      </th>
                    ))}
                    {currentTab.onRowClick ? <th></th> : null}
                  </tr>
                ))}
              </thead>
              <tbody>
                <AnimatePresence>
                  {currentTab.paginationProps?.isLoading ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td colSpan={columns.length} className="text-center py-6">
                        <ClipLoader size={30} color="hsl(var(--primary))" />
                      </td>
                    </motion.tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border/50 hover:bg-muted/30 cursor-pointer"
                        onClick={() => handleRowClick(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="h-[65px] px-[24px] py-[16px] whitespace-nowrap"
                          >
                            <div className="text-foreground text-[14px]">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </div>
                          </td>
                        ))}
                        {currentTab.onRowClick ? (
                          <td className="h-[65px] py-[16px] whitespace-nowrap">
                            <div className="flex h-full my-auto">
                              <ChevronRight
                                className="my-auto text-muted-foreground"
                                size={20}
                              />
                            </div>
                          </td>
                        ) : (
                          <></>
                        )}
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
            {currentTab.paginationProps && (
              <div className="px-[24px] bg-muted/70">
                <Pagination {...currentTab.paginationProps} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReusableTable;
