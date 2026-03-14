"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminPayments } from "@/lib/admin-api";
import type { PaymentTransaction } from "@/types/admin.types";
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
import { formatDateTime, formatUsd, truncateAddress } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentTransaction | null>(null);

  const { data, isLoading } = useQuery<{
    payments: PaymentTransaction[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ["admin-payments", page, status, method],
    queryFn: () =>
      getAdminPayments({
        page,
        limit: 20,
        status: status || undefined,
        method: method || undefined,
      }) as Promise<{
        payments: PaymentTransaction[];
        total: number;
        totalPages: number;
      }>,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} total
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v === "ALL" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMING">Confirming</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={method}
          onValueChange={(v) => {
            setMethod(v === "ALL" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            <SelectItem value="CRYPTO_DIRECT">Crypto Direct</SelectItem>
            <SelectItem value="CHAINRAILS">Chainrails</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Provider Ref</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <TableCell>
                      {payment.user ? (
                        <Link
                          href={`/users/${payment.user.id}`}
                          className="hover:underline text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {payment.user.display_name ||
                            truncateAddress(payment.user.wallet_address)}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatUsd(Number(payment.amount_usd))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.payment_method} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground max-w-[120px] truncate">
                      {payment.provider_ref || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(payment.created_at)}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Status History Dialog */}
      <Dialog
        open={!!selectedPayment}
        onOpenChange={() => setSelectedPayment(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">
                    {formatUsd(Number(selectedPayment.amount_usd))}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={selectedPayment.status} />
                </div>
                <div>
                  <p className="text-muted-foreground">Method</p>
                  <StatusBadge status={selectedPayment.payment_method} />
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{formatDateTime(selectedPayment.created_at)}</p>
                </div>
                {selectedPayment.provider_ref && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Provider Ref</p>
                    <p className="font-mono text-xs break-all">
                      {selectedPayment.provider_ref}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              {selectedPayment.status_history &&
                selectedPayment.status_history.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm font-medium mb-3">Status Timeline</p>
                    <div className="space-y-3">
                      {selectedPayment.status_history.map((entry, i) => (
                        <div key={entry.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                            {i < selectedPayment.status_history!.length - 1 && (
                              <div className="w-px h-6 bg-border" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={entry.to_status} />
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(entry.timestamp)}
                              </span>
                            </div>
                            {Boolean(
                              entry.metadata &&
                              (entry.metadata as Record<string, unknown>)
                                .reason,
                            ) && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {String(
                                  (entry.metadata as Record<string, unknown>)
                                    .reason,
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
