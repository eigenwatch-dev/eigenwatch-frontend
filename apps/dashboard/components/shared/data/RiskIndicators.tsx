import { Badge } from "@/components/ui/badge";
import { SectionContainer } from "./SectionContainer";
import { InfoTooltip } from "./InfoTooltip";
import { EDUCATIONAL_TOOLTIPS } from "@/lib/educational-content";
import { AlertTriangle, CheckCircle2, Shield } from "lucide-react";

interface RiskMetrics {
  avs_concentration_hhi?: number;
  strategy_concentration_hhi?: number;
  highest_single_avs_exposure_pct?: string;
  utilization_risk_level?: "low" | "moderate" | "high";
}

interface RiskIndicatorsProps {
  metrics?: RiskMetrics | null;
  showHeader?: boolean;
}

type ConcentrationLevel = "diversified" | "moderate" | "concentrated";

interface ConcentrationConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

const CONCENTRATION_CONFIG: Record<ConcentrationLevel, ConcentrationConfig> = {
  diversified: {
    label: "Diversified",
    color: "text-green-500",
    bgColor: "bg-green-500/10 border-green-500/20",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  moderate: {
    label: "Moderate",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
    icon: <Shield className="h-4 w-4" />,
  },
  concentrated: {
    label: "Concentrated",
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/20",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
};

function getConcentrationLevel(hhi: number): ConcentrationLevel {
  if (hhi < 1500) return "diversified";
  if (hhi < 2500) return "moderate";
  return "concentrated";
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  bgColor,
  tooltip,
}: {
  title: string;
  value: string | React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  tooltip?: string;
}) {
  return (
    <div className={`p-4 rounded-lg border ${bgColor || "bg-card"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          {tooltip && <InfoTooltip info={tooltip} />}
        </div>
        {icon && <span className={color}>{icon}</span>}
      </div>
      <div className={`text-lg font-semibold ${color || ""}`}>{value}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
    </div>
  );
}

export function RiskIndicators({ metrics, showHeader = true }: RiskIndicatorsProps) {
  if (!metrics) {
    return (
      <div className="p-4 rounded-lg border bg-muted/50 text-center text-muted-foreground">
        <p className="text-sm">Risk metrics not available</p>
      </div>
    );
  }

  const avsConcentration = metrics.avs_concentration_hhi
    ? getConcentrationLevel(metrics.avs_concentration_hhi)
    : null;
  const strategyConcentration = metrics.strategy_concentration_hhi
    ? getConcentrationLevel(metrics.strategy_concentration_hhi)
    : null;

  const avsConfig = avsConcentration ? CONCENTRATION_CONFIG[avsConcentration] : null;
  const strategyConfig = strategyConcentration
    ? CONCENTRATION_CONFIG[strategyConcentration]
    : null;

  const content = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* AVS Concentration */}
      <MetricCard
        title="AVS Concentration"
        value={
          avsConfig ? (
            <Badge
              variant="outline"
              className={`${avsConfig.color} ${avsConfig.bgColor}`}
            >
              {avsConfig.label}
            </Badge>
          ) : (
            "—"
          )
        }
        subtitle={
          metrics.avs_concentration_hhi
            ? `HHI: ${metrics.avs_concentration_hhi.toLocaleString()}`
            : undefined
        }
        icon={avsConfig?.icon}
        color={avsConfig?.color}
        tooltip={EDUCATIONAL_TOOLTIPS.hhi.detailed}
      />

      {/* Strategy Concentration */}
      <MetricCard
        title="Strategy Concentration"
        value={
          strategyConfig ? (
            <Badge
              variant="outline"
              className={`${strategyConfig.color} ${strategyConfig.bgColor}`}
            >
              {strategyConfig.label}
            </Badge>
          ) : (
            "—"
          )
        }
        subtitle={
          metrics.strategy_concentration_hhi
            ? `HHI: ${metrics.strategy_concentration_hhi.toLocaleString()}`
            : undefined
        }
        icon={strategyConfig?.icon}
        color={strategyConfig?.color}
        tooltip="Measures how concentrated allocations are across different strategies (asset types)."
      />

      {/* Largest AVS Exposure */}
      <MetricCard
        title="Largest AVS Exposure"
        value={
          metrics.highest_single_avs_exposure_pct
            ? `${metrics.highest_single_avs_exposure_pct}%`
            : "—"
        }
        subtitle="Percentage to single largest AVS"
        tooltip="The percentage of total allocations going to the single largest AVS. Higher concentration means more exposure to that AVS's risks."
      />
    </div>
  );

  if (!showHeader) {
    return content;
  }

  return (
    <SectionContainer
      heading="Risk Indicators"
      info="Concentration metrics help assess diversification and exposure risk"
    >
      {content}
    </SectionContainer>
  );
}

/**
 * Compact version for inline use
 */
export function ConcentrationBadge({ hhi }: { hhi: number | null | undefined }) {
  if (!hhi) return <span className="text-muted-foreground">—</span>;

  const level = getConcentrationLevel(hhi);
  const config = CONCENTRATION_CONFIG[level];

  return (
    <Badge variant="outline" className={`${config.color} ${config.bgColor}`}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </Badge>
  );
}
