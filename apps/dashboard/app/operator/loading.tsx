import { Skeleton } from "@/components/ui/skeleton";

export default function OperatorListLoading() {
  return (
    <div className="flex w-full flex-col pt-[48px] gap-[40px]">
      {/* Header */}
      <div className="flex flex-col gap-[40px]">
        <Skeleton className="h-[48px] w-48" />
        <div className="flex justify-between">
          <Skeleton className="h-[48px] max-w-[500px] w-full rounded-[10px]" />
          <Skeleton className="h-[48px] w-[220px] rounded-[10px]" />
        </div>
      </div>

      {/* Table */}
      <div className="w-full rounded-lg border border-border">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b border-border px-4 py-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24 flex-1" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0"
          >
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-8 w-8 rounded-[10px]" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full flex-1" />
            <Skeleton className="h-4 w-10 flex-1" />
            <Skeleton className="h-4 w-8 flex-1" />
            <Skeleton className="h-4 w-12 flex-1" />
            <Skeleton className="h-4 w-12 flex-1" />
          </div>
        ))}
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    </div>
  );
}
