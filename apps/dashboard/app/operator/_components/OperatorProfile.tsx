// components/operator/OperatorProfile.tsx
"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  Activity,
  Shield,
  AlertTriangle,
  Copy,
  ExternalLink,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useOperator, useOperatorStats } from "@/hooks/crud/useOperator";
import { useRiskAssessment } from "@/hooks/crud/useOperatorRisk";
import { formatUSD } from "@/lib/formatting";
import { QUERY_KEYS } from "@/lib/queryKey";
import { RiskBadge } from "@/components/shared/data/RiskBadge";
import { StatCard } from "@/components/shared/data/StatCard";
import { CardContainer } from "@/components/shared/data/CardContainer";
import { InfoHeading } from "@/components/shared/data/InfoHeading";
import { FeatureComingSoonModal } from "@/components/shared/FeatureComingSoonModal";
import { ProBadge } from "@/components/shared/ProGate";
import { ProGateCell } from "@/components/shared/ProGateCell";
import { useProAccess } from "@/hooks/useProAccess";
import { OperatorDetail, OperatorStats } from "@/types/operator.types";
import { useBreakpoint } from "@/hooks/ui/useBreakpoints";

// Lazy-loaded tab imports
import OverviewTab from "./tabs/OverviewTab";
import StrategiesTab from "./tabs/StrategiesTab";
import { AllocationsTab } from "./tabs/AllocationsTab";
import { AVSTab } from "./tabs/AVSTab";
import { CommissionTab } from "./tabs/CommissionTab";
import { DelegatorsTab } from "./tabs/DelegatorsTab";
import { RiskAnalysisTab } from "./tabs/RiskAnalysisTab";

// Server action imports for prefetching
import { getOperatorStrategies } from "@/actions/strategies";
import { getOperatorAVS } from "@/actions/avs";
import { getOperatorDelegators } from "@/actions/delegator";
import { getAllocationsOverview } from "@/actions/allocation";
import { getOperatorCommission } from "@/actions/commissions";
import { getRiskAssessment } from "@/actions/operator-risk";

interface OperatorProfileProps {
  operatorId: string;
  initialOperator?: OperatorDetail;
  initialStats?: OperatorStats;
}

const OperatorProfile = ({
  operatorId,
  initialOperator,
  initialStats,
}: OperatorProfileProps) => {
  const queryClient = useQueryClient();
  const { isFree } = useProAccess();
  const { isMaxMd } = useBreakpoint();
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);

  // Coming soon modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState({
    name: "",
    benefits: "",
  });

  // Hydrate React Query with server-fetched data (no loading flash on SSR)
  const { data: operatorData, isLoading: loadingOperator } = useOperator(
    operatorId,
    { initialData: initialOperator },
  );
  const { data: statsData, isLoading: loadingStats } = useOperatorStats(
    operatorId,
    { initialData: initialStats },
  );
  const { data: riskData } = useRiskAssessment(operatorId);

  const operator = operatorData;
  const stats = statsData;

  const copyAddress = () => {
    if (operator?.operator_address) {
      navigator.clipboard.writeText(operator.operator_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFeatureClick = (name: string, benefits: string) => {
    setComingSoonFeature({ name, benefits });
    setModalOpen(true);
  };

  // Prefetch tab data on hover for instant tab switches
  const handleTabHover = useCallback(
    (tabName: string) => {
      switch (tabName) {
        case "strategies":
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.operatorStrategies(operatorId),
            queryFn: () => getOperatorStrategies(operatorId),
            staleTime: 60_000,
          });
          break;
        case "avs":
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.operatorAVS(operatorId),
            queryFn: () => getOperatorAVS(operatorId),
            staleTime: 5 * 60_000,
          });
          break;
        case "delegators":
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.operatorDelegators(operatorId),
            queryFn: () => getOperatorDelegators(operatorId),
            staleTime: 2 * 60_000,
          });
          break;
        case "allocations":
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.operatorAllocations(operatorId),
            queryFn: () => getAllocationsOverview(operatorId),
            staleTime: 2 * 60_000,
          });
          break;
        case "commission":
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.operatorCommission(operatorId),
            queryFn: () => getOperatorCommission(operatorId),
            staleTime: 5 * 60_000,
          });
          break;
        case "risk":
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.operatorRisk(operatorId),
            queryFn: () => getRiskAssessment(operatorId),
            staleTime: 5 * 60_000,
          });
          break;
      }
    },
    [operatorId, queryClient],
  );

  if (loadingOperator) {
    return (
      <div className="min-h-screen py-6 sm:py-[45px] space-y-8">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="h-full min-h-[80hv] my-auto p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-4 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">
              Operator Not Found
            </h2>
            <p className="text-sm text-foreground">
              The operator you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <Button
              variant="outline"
              className=""
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full py-6 sm:py-[45px] space-y-4">
      {/* Back Button */}
      <div className="pb-2">
        <Link
          href="/operator"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Operators
        </Link>
      </div>

      {/* Header Section */}
      <div className="space-y-4 pb-2">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <Avatar className="h-14 w-14 sm:h-20 sm:w-20 rounded-lg shrink-0">
              <AvatarImage src={operator.metadata?.logo} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-xl sm:text-2xl font-[500]">
                {operator.metadata?.name?.[0] || "AO"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-bold break-words">
                  {operator.metadata?.name || "Anonymous Operator"}
                </h1>
                <Badge
                  className={
                    (operator.status.is_active
                      ? "bg-green-700/20 text-green-500"
                      : "bg-red-700/20 text-red-500") + " gap-1 "
                  }
                >
                  {operator.status.is_active ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </>
                  ) : (
                    "Inactive"
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="font-mono text-xs rounded">
                  {operator?.operator_address?.slice(0, 6)}...
                  {operator?.operator_address?.slice(-4)}
                </span>
                <button onClick={copyAddress}>
                  {copied ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                {operator.metadata?.website && (
                  <button>
                    <a
                      href={operator.metadata.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </button>
                )}
              </div>

              {operator.metadata?.description && (
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl line-clamp-3 sm:line-clamp-none">
                  {operator.metadata.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button size="sm" className="flex-1 sm:flex-initial" onClick={() => handleFeatureClick("Operator Comparison", "Compare operators side-by-side across risk metrics, TVS, delegation counts, and performance history.")}>
              Compare
            </Button>
            <Button size="sm" className="flex-1 sm:flex-initial" onClick={() => handleFeatureClick("Watchlist", "Track operators, receive real-time alerts on risk changes, slashing events, and delegation shifts.")}>
              Watch
            </Button>
            <Button size="sm" className="flex-1 sm:flex-initial" onClick={() => handleFeatureClick("Delegation", "Delegate directly from the dashboard with risk-aware routing and optimal strategy selection.")}>
              Delegate
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Value Secured"
          value={formatUSD(stats?.tvs.total || 0)}
          subtitle="Assets under management"
          icon={<Activity />}
          tooltip="The total value of assets delegated to this operator. A higher TVS indicates more trust from stakers."
          isLoading={loadingStats}
        />

        <StatCard
          title="Delegators"
          value={stats?.delegation.active_delegators || 0}
          subtitle={`${
            stats?.delegation.active_delegators || 0
          } active stakers`}
          icon={<Users />}
          tooltip="A staker delegates their assets to an operator they trust. The operator uses this delegation to provide services."
          isLoading={loadingStats}
        />

        <StatCard
          title="Active AVS"
          value={stats?.avs_participation.active_avs_count || 0}
          subtitle="Registered services"
          icon={<Shield />}
          tooltip="An AVS is a protocol that uses EigenLayer for security. Operators register with AVSs to provide validation services."
          isLoading={loadingStats}
        />

        <StatCard
          title="Operational Days"
          value={operator.status.operational_days}
          subtitle={`≈ ${Math.floor(
            operator.status.operational_days / 30,
          )} months`}
          icon={<TrendingUp />}
          tooltip="The number of days this operator has been actively operating. Longer operational history can indicate more experience."
          isLoading={loadingStats}
        />
      </div>

      {/* Risk & Commission Bar */}
      <CardContainer>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <InfoHeading
              heading="Risk Assessment"
              info="An overall risk assessment score. Higher scores indicate safer operators with better track records."
            />
            <ProGateCell
              isLocked={isFree}
              feature="Risk Score"
              description="Unlock detailed risk scores and assessments to evaluate operator safety before delegating."
            >
              <RiskBadge
                level={riskData?.risk_level || "MEDIUM"}
                score={riskData?.scores.risk.toString() || "---"}
              />
            </ProGateCell>
          </div>

          <div className="space-y-2 sm:flex-1 sm:max-w-[250px]">
            <div className="flex items-center justify-between gap-2">
              <InfoHeading
                heading="Commission Rate"
                info="The fee the operator charges for their services. Measured in bips (1 bip = 0.01%). For example, 1000 bips = 10%."
              />
              <span className="text-sm font-semibold text-muted-foreground">
                {(stats?.commission.pi_split_bips || 0) / 100}%
              </span>
            </div>
            <Progress
              value={stats?.commission.pi_split_bips || 0}
              className="h-2 mt-auto bg-muted mt-4"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <InfoHeading
                heading="Slashing Events"
                info="A penalty applied when an operator fails to perform their duties or acts maliciously. Slashed operators lose assets."
              />
              <span
                className={`text-sm font-semibold ${
                  (riskData?.metrics.slashing.count ??
                    operator.performance_summary.total_slash_events) > 0
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {riskData?.metrics.slashing.count ??
                  operator.performance_summary.total_slash_events}
              </span>
            </div>
            {(riskData?.metrics.slashing.count ??
              operator.performance_summary.total_slash_events) > 0 ? (
              <div className="flex items-center gap-2 text-xs text-red-500">
                <AlertTriangle className="h-3 w-3" />
                <span>Historical slashing detected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-500">
                <CheckCircle2 className="h-3 w-3" />
                <span>No slashing events</span>
              </div>
            )}
          </div>
        </div>
      </CardContainer>

      {/* Tabbed Content - Lazy loaded: only active tab renders */}
      {isMaxMd ? (
        /* Mobile: Dropdown tab selector */
        <div className="space-y-3">
          <div className="relative">
            <button
              onClick={() => setTabDropdownOpen(!tabDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-medium"
            >
              <span>
                {[
                  { value: "overview", label: "Overview" },
                  { value: "strategies", label: "Strategies" },
                  { value: "avs", label: "AVS" },
                  { value: "delegators", label: "Delegators" },
                  { value: "allocations", label: "Allocations" },
                  { value: "commission", label: "Commission" },
                  { value: "risk", label: "Risk Analysis" },
                ].find((t) => t.value === activeTab)?.label}
                {activeTab === "risk" && <ProBadge />}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${tabDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {tabDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-lg bg-card border border-border shadow-lg overflow-hidden">
                {[
                  { value: "overview", label: "Overview" },
                  { value: "strategies", label: "Strategies" },
                  { value: "avs", label: "AVS" },
                  { value: "delegators", label: "Delegators" },
                  { value: "allocations", label: "Allocations" },
                  { value: "commission", label: "Commission" },
                  { value: "risk", label: "Risk Analysis" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setTabDropdownOpen(false);
                      handleTabHover(tab.value);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      activeTab === tab.value
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {tab.value === "risk" && <span className="ml-1"><ProBadge /></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeTab === "overview" && <OverviewTab operator={operator} />}
          {activeTab === "strategies" && <StrategiesTab operatorId={operatorId} />}
          {activeTab === "avs" && <AVSTab operatorId={operatorId} />}
          {activeTab === "delegators" && <DelegatorsTab operatorId={operatorId} />}
          {activeTab === "allocations" && <AllocationsTab operatorId={operatorId} />}
          {activeTab === "commission" && <CommissionTab operatorId={operatorId} />}
          {activeTab === "risk" && (
            <RiskAnalysisTab operatorId={operatorId} operationalDays={operator.status.operational_days} />
          )}
        </div>
      ) : (
        /* Desktop: Grid tabs */
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-2"
        >
          <TabsList className="grid w-full grid-cols-7 bg-muted/50 text-foreground">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger
              value="strategies"
              onMouseEnter={() => handleTabHover("strategies")}
            >
              Strategies
            </TabsTrigger>
            <TabsTrigger value="avs" onMouseEnter={() => handleTabHover("avs")}>
              AVS
            </TabsTrigger>
            <TabsTrigger
              value="delegators"
              onMouseEnter={() => handleTabHover("delegators")}
            >
              Delegators
            </TabsTrigger>
            <TabsTrigger
              value="allocations"
              onMouseEnter={() => handleTabHover("allocations")}
            >
              Allocations
            </TabsTrigger>
            <TabsTrigger
              value="commission"
              onMouseEnter={() => handleTabHover("commission")}
            >
              Commission
            </TabsTrigger>
            <TabsTrigger value="risk" onMouseEnter={() => handleTabHover("risk")}>
              Risk Analysis <ProBadge />
            </TabsTrigger>
          </TabsList>

          {activeTab === "overview" && <OverviewTab operator={operator} />}
          {activeTab === "strategies" && <StrategiesTab operatorId={operatorId} />}
          {activeTab === "avs" && <AVSTab operatorId={operatorId} />}
          {activeTab === "delegators" && <DelegatorsTab operatorId={operatorId} />}
          {activeTab === "allocations" && <AllocationsTab operatorId={operatorId} />}
          {activeTab === "commission" && <CommissionTab operatorId={operatorId} />}
          {activeTab === "risk" && (
            <RiskAnalysisTab operatorId={operatorId} operationalDays={operator.status.operational_days} />
          )}
        </Tabs>
      )}

      <FeatureComingSoonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureName={comingSoonFeature.name}
        benefits={comingSoonFeature.benefits}
      />
    </div>
  );
};

export default OperatorProfile;
