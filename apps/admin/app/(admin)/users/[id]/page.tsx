"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUser, updateUserTier } from "@/lib/admin-api";
import type { AdminUser } from "@/types/admin.types";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate, formatDateTime, truncateAddress, formatUsd } from "@/lib/utils";
import { ArrowLeft, Pencil, Check, X, Mail, Shield, Laptop, CreditCard, FlaskConical } from "lucide-react";
import Link from "next/link";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [newTier, setNewTier] = useState("");
  const [newExpiry, setNewExpiry] = useState("");

  const { data: user, isLoading } = useQuery<AdminUser>({
    queryKey: ["admin-user", id],
    queryFn: () => getAdminUser(id),
  });

  const tierMutation = useMutation({
    mutationFn: () =>
      updateUserTier(id, newTier, newExpiry || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      setTierDialogOpen(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) return <p className="text-muted-foreground">User not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {user.display_name || truncateAddress(user.wallet_address)}
        </h1>
      </div>

      {/* Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Wallet Address</p>
              <p className="font-mono text-xs mt-1">{user.wallet_address}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Display Name</p>
              <p className="mt-1">{user.display_name || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tier</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={user.tier} />
                {user.tier_expires_at && (
                  <span className="text-xs text-muted-foreground">
                    expires {formatDate(user.tier_expires_at)}
                  </span>
                )}
                <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => {
                        setNewTier(user.tier);
                        setNewExpiry(
                          user.tier_expires_at
                            ? new Date(user.tier_expires_at).toISOString().split("T")[0]!
                            : "",
                        );
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update User Tier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Tier</Label>
                        <Select value={newTier} onValueChange={setNewTier}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FREE">Free</SelectItem>
                            <SelectItem value="PRO">Pro</SelectItem>
                            <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Expires At (optional)</Label>
                        <Input
                          type="date"
                          value={newExpiry}
                          onChange={(e) => setNewExpiry(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setTierDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={() => tierMutation.mutate()}
                          disabled={tierMutation.isPending}
                        >
                          {tierMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Joined</p>
              <p className="mt-1">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emails */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" /> Emails ({user.emails?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.emails && user.emails.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.emails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="text-sm">{email.email}</TableCell>
                    <TableCell>
                      {email.is_primary ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell>
                      {email.is_verified ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(email.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No emails</p>
          )}
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Laptop className="h-4 w-4 text-muted-foreground" /> Active Sessions ({user.sessions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.sessions && user.sessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="text-sm">{session.device_info || "Unknown"}</TableCell>
                    <TableCell className="text-sm font-mono">{session.ip_address || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(session.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(session.expires_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No active sessions</p>
          )}
        </CardContent>
      </Card>

      {/* Beta Perks */}
      {user.beta_perks && user.beta_perks.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" /> Beta Perks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.beta_perks.map((bp) => (
                <div
                  key={bp.id}
                  className="flex items-center justify-between p-3 rounded-md bg-secondary/50"
                >
                  <div>
                    <p className="text-sm font-medium">{bp.perk.key}</p>
                    <p className="text-xs text-muted-foreground">{bp.perk.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(bp.activated_at)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment History ({user.payments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.payments && user.payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm font-medium">
                      {formatUsd(Number(payment.amount_usd))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.payment_method} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(payment.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No payments</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
