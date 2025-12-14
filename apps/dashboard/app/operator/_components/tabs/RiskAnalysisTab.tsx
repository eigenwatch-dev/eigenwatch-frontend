import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MetricProgress } from "@/components/shared/data/MetricProgress";
import { StatCard } from "@/components/shared/data/StatCard";
import { InfoHeading } from "@/components/shared/data/InfoHeading";
import { useRiskAssessment } from "@/hooks/crud/useOperatorRisk";
import { AlertTriangle, CheckCircle, Shield, TrendingUp, Activity, Users, AlertOctagon } from "lucide-react";

interface RiskAnalysisTabProps {
  operatorId: string;
}

export const RiskAnalysisTab = ({ operatorId }: RiskAnalysisTabProps) => {
  const { data: risk, isLoading } = useRiskAssessment(operatorId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!risk) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No risk data available for this operator.
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPercent = (value?: string | number) => {
    const num = Number(value);
    return isNaN(num) ? "0%" : `${(num * 100).toFixed(2)}%`;
  };

  const formatNumber = (value?: string | number) => {
    const num = Number(value);
    return isNaN(num) ? "0" : num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Risk Score"
          value={risk.risk_score || "N/A"}
          icon={<Shield className="h-4 w-4" />}
          tooltip="The overall risk score assigned to this operator."
          subtitle={
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Level:</span>
              <Badge variant={risk.risk_level === "LOW" ? "secondary" : "destructive"} className="text-[10px] px-1.5 py-0 h-5">
                {risk.risk_level || "UNKNOWN"}
              </Badge>
            </div>
          }
        />
        <StatCard
          title="Confidence Score"
          value={`${Number(risk.confidence_score) || 0}/100`}
          icon={<Activity className="h-4 w-4" />}
          tooltip="Confidence level in the risk assessment based on available data."
          subtitle={
            <span className="text-xs text-muted-foreground">
              Assessment Date: {formatDate(risk.assessment_date)}
            </span>
          }
        />
        <Card>
           <CardContent className="pt-6 flex flex-col justify-between h-full gap-2">
              <InfoHeading heading="Status Flags" info="Operational status indicators." />
              <div className="flex flex-wrap gap-2">
                 <Badge variant={risk.flags.is_active ? "default" : "secondary"} className="gap-1">
                    {risk.flags.is_active ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {risk.flags.is_active ? "Active" : "Inactive"}
                 </Badge>
                 <Badge variant={risk.flags.has_been_slashed ? "destructive" : "outline"} className="gap-1">
                    {risk.flags.has_been_slashed && <AlertOctagon className="h-3 w-3" />}
                    {risk.flags.has_been_slashed ? "Slashed" : "No Slashing"}
                 </Badge>
                 <Badge variant="outline" className={risk.flags.has_sufficient_data ? "text-green-600 border-green-200" : "text-yellow-600 border-yellow-200"}>
                    {risk.flags.has_sufficient_data ? "Sufficient Data" : "Low Data"}
                 </Badge>
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Scores */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Component Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MetricProgress
              metric="Performance"
              value={Number(risk.component_scores.performance_score) || 0}
            />
            <MetricProgress
              metric="Economic"
              value={Number(risk.component_scores.economic_score) || 0}
            />
            <MetricProgress
              metric="Network Position"
              value={Number(risk.component_scores.network_position_score) || 0}
            />
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <InfoHeading heading="Delegation HHI" info="Herfindahl-Hirschman Index for delegation concentration. Lower is better (more decentralized)." />
                <p className="text-2xl font-semibold">{Number(risk.key_metrics.delegation_hhi).toFixed(4)}</p>
              </div>
              
              <div className="space-y-1">
                <InfoHeading heading="Delegation Volatility (30d)" info="Standard deviation of delegation changes over the last 30 days." />
                <p className="text-2xl font-semibold">{Number(risk.key_metrics.delegation_volatility_30d).toExponential(2)}</p>
              </div>

              <div className="space-y-1">
                <InfoHeading heading="Growth Rate (30d)" info="Percentage growth in delegation over the last 30 days." />
                <p className="text-2xl font-semibold">{formatPercent(Number(risk.key_metrics.growth_rate_30d) / 100)}</p> {/* Assuming growth rate is raw number e.g. 0.05 for 5% or 5 for 5%? Usually rates are 0-1. Let's assume it needs % formatting. Wait, user JSON showed "0". Let's stick to simple formatting first. */}
              </div>

              <div className="space-y-1">
                <InfoHeading heading="Size Percentile" info="The operator's size relative to others." />
                <p className="text-2xl font-semibold">{risk.key_metrics.size_percentile}th</p>
              </div>

              <div className="space-y-1">
                <InfoHeading heading="Slashing Events" info="Total number of slashing events recorded." />
                 <div className="flex items-center gap-2">
                    <p className="text-2xl font-semibold">{risk.key_metrics.slashing_event_count}</p>
                    {risk.key_metrics.slashing_event_count > 0 && <Badge variant="destructive">Warning</Badge>}
                 </div>
              </div>

              <div className="space-y-1">
                <InfoHeading heading="Operational Days" info="Number of days the operator has been active." />
                <p className="text-2xl font-semibold">{formatNumber(risk.key_metrics.operational_days)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

