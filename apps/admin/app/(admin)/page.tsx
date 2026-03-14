"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/lib/admin-api";
import type { AdminStats } from "@/types/admin.types";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUsd } from "@/lib/utils";
import {
  Users,
  CreditCard,
  MessageSquare,
  FlaskConical,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          subtitle={`+${stats.users.new_this_week} this week`}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Pro Users"
          value={stats.users.pro}
          subtitle={`${stats.users.enterprise} enterprise`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatUsd(stats.revenue.total_usd)}
          subtitle={`${formatUsd(stats.revenue.this_month_usd)} this month`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Beta Members"
          value={stats.beta.active_members}
          icon={<FlaskConical className="h-5 w-5" />}
        />
      </div>

      {/* Payment & Feedback Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Payment Conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Attempts</span>
              <span>{stats.payments.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confirmed</span>
              <span className="text-green-500">{stats.payments.confirmed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conversion Rate</span>
              <span className="font-medium">{stats.payments.conversion_rate}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${stats.payments.conversion_rate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Feedback ({stats.feedback.total})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.feedback.by_type).map(([type, count]) => (
                <div key={type} className="flex items-center gap-2">
                  <StatusBadge status={type} />
                  <span className="text-sm">{count}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {Object.entries(stats.feedback.by_sentiment).map(
                ([sentiment, count]) => (
                  <div key={sentiment} className="flex items-center gap-2">
                    <StatusBadge status={sentiment} />
                    <span className="text-sm">{count}</span>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">New this week</p>
              <p className="text-xl font-bold">{stats.users.new_this_week}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New this month</p>
              <p className="text-xl font-bold">{stats.users.new_this_month}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Free users</p>
              <p className="text-xl font-bold">{stats.users.free}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
