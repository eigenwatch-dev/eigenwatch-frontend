import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InfoHeading } from "@/components/shared/data/InfoHeading";
import { useRiskAssessment } from "@/hooks/crud/useOperatorRisk";
import {
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertOctagon,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

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

  // Helper to format numbers
  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercent = (num: number) => `${(num * 100).toFixed(2)}%`;

  // --- Logic for Metrics ---

  // Risk Score Color
  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getRiskBadgeVariant = (level: string) => {
      switch(level) {
          case "LOW": return "default"; // Greenish usually or default primary
          case "MEDIUM": return "secondary"; // Yellowish/Grey
          case "HIGH": return "destructive";
          case "CRITICAL": return "destructive";
          default: return "outline";
      }
  };

  // Slashing Logic
  const slashingCount = risk.metrics.slashing.count;
  const isSlashed = slashingCount > 0;

  // Operational Days Logic
  const opDays = risk.metrics.activity.operational_days;
  const isNewEntrant = opDays < 30;

  // HHI Logic
  const hhi = risk.metrics.delegation.hhi;
  const hhiLabel = hhi < 0.1 ? "Healthy Distribution" : hhi < 0.25 ? "Moderate Concentration" : "Highly Concentrated";
  const hhiColor = hhi < 0.1 ? "bg-green-500" : hhi < 0.25 ? "bg-yellow-500" : "bg-red-500";

  // Volatility Logic
  const vol = risk.metrics.delegation.volatility_30d;
  const volLabel = vol < 0.01 ? "Very Stable" : vol < 0.05 ? "Stable" : "Volatile";
  const volBadgeVariant = vol < 0.01 ? "default" : vol < 0.05 ? "secondary" : "destructive";

  return (
    <div className="space-y-8">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Score Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getRiskColor(risk.scores.risk)}`}>
                {risk.scores.risk}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
                <Badge variant={getRiskBadgeVariant(risk.risk_level)}>{risk.risk_level} RISK</Badge>
                <span className="text-xs text-muted-foreground">Confidence: {risk.scores.confidence}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Slashing Status Card */}
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Slashing History</CardTitle>
            </CardHeader>
            <CardContent>
                {isSlashed ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-destructive font-bold text-xl">
                            <AlertOctagon className="h-6 w-6" />
                            <span>{slashingCount} Events</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Total Penalties: {risk.metrics.slashing.lifetime_amount}</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-green-600 font-bold text-xl">
                            <Shield className="h-6 w-6" />
                            <span>Clean Record</span>
                        </div>
                        <p className="text-xs text-muted-foreground">No slashing events recorded.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Stability / Operational Status */}
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Operational Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                         <span className="text-2xl font-bold">{formatNumber(opDays)}</span>
                         <span className="text-sm text-muted-foreground">Days Active</span>
                    </div>
                    {isNewEntrant && (
                        <Badge variant="secondary" className="w-fit gap-1">
                            <Info className="h-3 w-3" /> New Entrant
                        </Badge>
                    )}
                    {!isNewEntrant && (
                        <Badge variant="outline" className="w-fit text-green-600 border-green-200 gap-1">
                            <CheckCircle className="h-3 w-3" /> Established
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* 2. Key Metrics Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" /> Key Risk Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delegation HHI */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <InfoHeading heading="Delegation Concentration (HHI)" info="Measures how concentrated the delegation is. Lower is better (more decentralized)." />
                        <span className="text-sm font-mono text-muted-foreground">{hhi.toFixed(4)}</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{hhiLabel}</span>
                        </div>
                        <Progress value={Math.min(hhi * 100, 100)} className="h-2" indicatorClassName={hhiColor} />
                    </div>
                </CardContent>
            </Card>

            {/* Volatility */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-start">
                         <InfoHeading heading="Delegation Volatility (30d)" info="Standard deviation of delegation changes over the last 30 days." />
                         <Badge variant={volBadgeVariant}>{volLabel}</Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{vol.toExponential(2)}</span>
                        <span className="text-sm text-muted-foreground">std dev</span>
                    </div>
                </CardContent>
            </Card>

            {/* Size Percentile */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <InfoHeading heading="Size Percentile" info="The operator's size relative to the rest of the network." />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                            {risk.metrics.delegation.size_percentile >= 90 ? "Top 10%" : 
                             risk.metrics.delegation.size_percentile >= 50 ? "Above Median" : "Below Median"}
                        </span>
                        <span className="text-sm text-muted-foreground">({risk.metrics.delegation.size_percentile}th Percentile)</span>
                    </div>
                </CardContent>
            </Card>

             {/* Growth Rate */}
             <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <InfoHeading heading="Growth Rate (30d)" info="Change in delegation over the last 30 days." />
                        <TrendingUp className={`h-4 w-4 ${risk.metrics.delegation.growth_rate_30d >= 0 ? "text-green-500" : "text-red-500"}`} />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${risk.metrics.delegation.growth_rate_30d >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {risk.metrics.delegation.growth_rate_30d > 0 ? "+" : ""}
                            {formatPercent(risk.metrics.delegation.growth_rate_30d)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* 3. Deep Dive Section */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced-metrics">
          <AccordionTrigger>Advanced Metrics & Raw Data</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Concentration Details */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Concentration Analysis</h4>
                        <Separator />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Gini Coefficient</span>
                                <span className="font-mono">{risk.concentration.delegation?.gini_coefficient || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Top 1% Share</span>
                                <span className="font-mono">{risk.concentration.delegation?.top_1_percentage || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Top 10% Share</span>
                                <span className="font-mono">{risk.concentration.delegation?.top_10_percentage || "N/A"}</span>
                            </div>
                             <div className="flex justify-between">
                                <span>Effective Entities</span>
                                <span className="font-mono">{risk.concentration.delegation?.effective_entities || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Volatility Details */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Volatility Analysis</h4>
                        <Separator />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>7d Volatility</span>
                                <span className="font-mono">{risk.volatility.tvs?.volatility_7d || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>90d Volatility</span>
                                <span className="font-mono">{risk.volatility.tvs?.volatility_90d || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Trend Direction</span>
                                <span className="font-mono capitalize">{risk.volatility.tvs?.trend_direction?.toLowerCase() || "N/A"}</span>
                            </div>
                             <div className="flex justify-between">
                                <span>Coeff. of Variation</span>
                                <span className="font-mono">{risk.volatility.tvs?.coefficient_of_variation || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

