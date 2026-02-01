import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EDUCATIONAL_TOOLTIPS } from "@/lib/educational-content";

interface UtilizationBadgeProps {
  pct: string | number | null | undefined;
  showTooltip?: boolean;
  size?: "sm" | "md";
}

type UtilizationStatus = "low" | "moderate" | "high" | "critical";

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  tooltipKey: "utilizationLow" | "utilizationModerate" | "utilizationHigh" | "utilizationCritical";
}

const STATUS_CONFIG: Record<UtilizationStatus, StatusConfig> = {
  low: {
    label: "Low",
    color: "text-green-500",
    bgColor: "bg-green-500/10 border-green-500/20",
    tooltipKey: "utilizationLow",
  },
  moderate: {
    label: "Moderate",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
    tooltipKey: "utilizationModerate",
  },
  high: {
    label: "High",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    tooltipKey: "utilizationHigh",
  },
  critical: {
    label: "Critical",
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/20",
    tooltipKey: "utilizationCritical",
  },
};

function getUtilizationStatus(value: number): UtilizationStatus {
  if (value < 50) return "low";
  if (value < 70) return "moderate";
  if (value < 90) return "high";
  return "critical";
}

export function UtilizationBadge({
  pct,
  showTooltip = true,
  size = "sm",
}: UtilizationBadgeProps) {
  const value = parseFloat(String(pct)) || 0;
  const status = getUtilizationStatus(value);
  const config = STATUS_CONFIG[status];

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  const badge = (
    <Badge
      variant="outline"
      className={`${config.color} ${config.bgColor} ${sizeClasses} font-medium`}
    >
      {config.label} ({value.toFixed(1)}%)
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  const tooltipContent = EDUCATIONAL_TOOLTIPS[config.tooltipKey];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm font-medium">{tooltipContent.short}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {tooltipContent.detailed}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Simple utility function to get utilization status without rendering
 */
export function getUtilizationStatusInfo(pct: number | string | null | undefined) {
  const value = parseFloat(String(pct)) || 0;
  const status = getUtilizationStatus(value);
  return {
    status,
    ...STATUS_CONFIG[status],
    value,
  };
}
