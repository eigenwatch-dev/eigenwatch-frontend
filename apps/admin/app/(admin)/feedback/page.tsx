"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminFeedback, deleteAdminFeedback } from "@/lib/admin-api";
import { Feedback } from "@/types/admin.types";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, truncateAddress } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export default function FeedbackPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const { data, isLoading } = useQuery<{
    feedback: Feedback[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ["admin-feedback", page, type, sentiment],
    queryFn: () =>
      getAdminFeedback({
        page,
        limit: 20,
        type: type || undefined,
        sentiment: sentiment || undefined,
      }) as Promise<{ feedback: Feedback[]; total: number; totalPages: number }>,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      setSelectedFeedback(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feedback</h1>
        {data && (
          <span className="text-sm text-muted-foreground">{data.total} total</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={type} onValueChange={(v) => { setType(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
            <SelectItem value="INLINE">Inline</SelectItem>
            <SelectItem value="PAYWALL">Paywall</SelectItem>
            <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sentiment} onValueChange={(v) => { setSentiment(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Sentiments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Sentiments</SelectItem>
            <SelectItem value="POSITIVE">Positive</SelectItem>
            <SelectItem value="NEGATIVE">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Type</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.feedback.map((fb) => (
                  <TableRow
                    key={fb.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedFeedback(fb)}
                  >
                    <TableCell>
                      <StatusBadge status={fb.type} />
                    </TableCell>
                    <TableCell>
                      {fb.sentiment ? <StatusBadge status={fb.sentiment} /> : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm max-w-[250px] truncate">
                      {fb.message || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fb.user ? (fb.user.display_name || truncateAddress(fb.user.wallet_address)) : (fb.email || "Anonymous")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                      {fb.page_url || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(fb.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Feedback Detail</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <StatusBadge status={selectedFeedback.type} />
                {selectedFeedback.sentiment && <StatusBadge status={selectedFeedback.sentiment} />}
                {selectedFeedback.category && (
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                    {selectedFeedback.category}
                  </span>
                )}
              </div>

              {selectedFeedback.message && (
                <div className="bg-secondary/50 p-3 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p>{selectedFeedback.user?.display_name || selectedFeedback.email || "Anonymous"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{formatDateTime(selectedFeedback.created_at)}</p>
                </div>
                {selectedFeedback.page_url && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Page</p>
                    <p className="text-xs break-all">{selectedFeedback.page_url}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(selectedFeedback.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
