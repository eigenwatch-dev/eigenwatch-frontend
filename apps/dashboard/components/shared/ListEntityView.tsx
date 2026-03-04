/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "../ui/input-group";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import ReusableTable, { TableColumnConfig } from "./table/ReuseableTable";
import { PaginationProps } from "./table/components/Pagination";

export function ListEntityView({
  searchPlaceholder,
  entity,
  tableConfig,
  searchValue,
  onSearchChange,
}: {
  entity: string;
  searchPlaceholder?: string;
  tableConfig: {
    columns: TableColumnConfig[];
    data: Record<string, any>[];
    paginationProps?: PaginationProps;
    onRowClick?: (row: any) => void;
  };
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  return (
    <div className="flex w-full flex-col pt-[48px] gap-[40px]">
      <div className="flex flex-col gap-[40px]">
        <h2 className="text-[48px] ">{entity}</h2>
        <div className="flex justify-between">
          <InputGroup className="max-w-[500px] my-auto bg-[#18181B80] border-[1.33px] border-[#27272A80] py-[4px] h-[48px] gap-[8px] px-[8px]">
            <InputGroupInput
              placeholder={searchPlaceholder || "Search..."}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          {/* Commented out inactive toggle as requested */}
          {/* <div className="flex items-center gap-[12px] border-[1.33px] border-[#27272A80] bg-[#18181B80] px-[16px] py-[12px] rounded-[10px]">
            <Switch id="show-inactive" />
            <Label htmlFor="show-inactive" className="text-[14px]">
              Hide inactive {entity.toLowerCase()}
            </Label>
          </div> */}
        </div>
      </div>
      <div className="flex w-full">
        <ReusableTable
          columns={tableConfig.columns}
          data={tableConfig.data}
          tableFilters={{ title: entity }}
          paginationProps={tableConfig.paginationProps}
          onRowClick={tableConfig.onRowClick}
        />
      </div>
    </div>
  );
}
