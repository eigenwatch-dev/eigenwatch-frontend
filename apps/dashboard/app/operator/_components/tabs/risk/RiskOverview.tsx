import { StatCard } from "@/components/shared/data/StatCard";
import { RiskBadge } from "@/components/shared/data/RiskBadge";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, Activity, Info } from "lucide-react";
import { OperatorRiskProfile } from "@/types/risk.types";
import { StatusIndicator } from "./StatusIndicator";
import { formatNumber } from "./utils";

export const RiskOverview = ({
  risk,
  operationalDays,
}: {
  risk: OperatorRiskProfile;
  operationalDays?: number;
}) => {
  const currentOperationalDays =
    operationalDays ?? risk.metrics.activity.operational_days;
  const isSlashed = risk.metrics.slashing.count > 0;
  const isNewOperator = currentOperationalDays < 30;
  const isEstablished = currentOperationalDays >= 180;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Risk Assessment"
        value={
          <div className="flex items-center gap-3">
            <span className="text-[26px]">{risk.scores.risk}</span>
            <span className="text-base text-muted-foreground">/100</span>
          </div>
        }
        subtitle={
          <RiskBadge
            level={risk.risk_level}
            score={risk.scores.confidence.toString()}
            scoreType="confidence"
          />
        }
        icon={
          risk.risk_level === "LOW" || risk.risk_level === "MEDIUM" ? (
            <Shield className="h-6 w-6" />
          ) : (
            <ShieldAlert className="h-6 w-6" />
          )
        }
        tooltip="Composite risk score based on slashing history, delegation stability, and operational metrics"
      />

      <StatCard
        title="Slashing History"
        value={
          isSlashed ? (
            <span className="text-red-600 text-[26px]">
              {risk.metrics.slashing.count} Events
            </span>
          ) : (
            <span className="text-green-600 text-[26px]">Clean Record</span>
          )
        }
        subtitle={
          isSlashed ? (
            <span className="text-sm">
              {/* Total penalties: {risk.metrics.slashing.lifetime_amount} */}
            </span>
          ) : (
            <StatusIndicator status="success" label="No penalties recorded" />
          )
        }
        icon={
          isSlashed ? (
            <ShieldAlert className="h-6 w-6 text-red-500" />
          ) : (
            <Shield className="h-6 w-6 text-green-500" />
          )
        }
        tooltip="Historical record of slashing events and penalties incurred by this operator"
      />

      <StatCard
        title="Operational History"
        value={`${formatNumber(currentOperationalDays)} Days`}
        subtitle={
          isNewOperator ? (
            <Badge variant="secondary" className="gap-1">
              <Info className="h-3 w-3" /> New Operator
            </Badge>
          ) : isEstablished ? (
            <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
              <Shield className="h-3 w-3" /> Established
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" /> Active
            </Badge>
          )
        }
        icon={<Activity className="h-6 w-6" />}
        tooltip={
          isNewOperator
            ? "New operator - limited historical data available for risk assessment"
            : isEstablished
              ? "Long-standing operator with proven track record and extensive history"
              : "Operator with sufficient operational history for reliable risk assessment"
        }
      />
    </div>
  );
};
