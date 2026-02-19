import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 pt-[30px]">
      <div className="max-w-md w-full rounded-lg border border-border bg-card text-center p-12 space-y-6">
        <Skeleton className="h-12 w-12 rounded-md mx-auto" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-24 mx-auto rounded-full" />
          <Skeleton className="h-7 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
        <Skeleton className="h-9 w-28 mx-auto rounded-md" />
      </div>
    </div>
  );
}
