import { CardContainer } from '@/components/shared/data/CardContainer';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Info } from 'lucide-react';
import { useRiskAssessment } from '@/hooks/crud/useOperatorRisk';
import { ProGate } from '@/components/shared/ProGate';
import { useProAccess } from '@/hooks/useProAccess';
import { RiskOverview } from './risk/RiskOverview';
import { RiskScoreBreakdown } from './risk/RiskScoreBreakdown';
import { DelegationStabilityMetrics } from './risk/DelegationStabilityMetrics';
import { DelegationDistributionAnalysis } from './risk/DelegationDistributionAnalysis';
import { AdvancedMetrics } from './risk/AdvancedMetrics';
import { formatDate } from './risk/utils';

interface RiskAnalysisTabProps {
  operatorId: string;
}

export const RiskAnalysisTab = ({ operatorId }: RiskAnalysisTabProps) => {
  const { isFree } = useProAccess();
  const { data: risk, isLoading } = useRiskAssessment(operatorId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!risk) {
    return (
      <CardContainer>
        <div className="py-12 text-center text-muted-foreground">
          No risk data available for this operator.
        </div>
      </CardContainer>
    );
  }

  return (
    <ProGate
      isLocked={isFree}
      feature="Risk Analysis"
      description="Unlock EigenWatch's full risk analysis — numeric scores, risk breakdown, delegation stability metrics, and advanced data. This is our core intelligence product."
    >
      <div className="space-y-4">
        {/* Assessment Date Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Assessment Date: {formatDate(risk.assessment_date)}</span>
          </div>
          {!risk.flags.has_sufficient_data && (
            <Badge variant="secondary" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> Limited Data
            </Badge>
          )}
          {!risk.flags.is_active && (
            <Badge variant="destructive" className="gap-1">
              <Info className="h-3 w-3" /> Inactive
            </Badge>
          )}
        </div>

        {/* Hero Section - Risk Overview */}
        <RiskOverview risk={risk} />

        {/* All Component Scores */}
        <RiskScoreBreakdown risk={risk} />

        {/* Key Risk Metrics */}
        <DelegationStabilityMetrics risk={risk} />

        {/* Concentration Visualization */}
        <DelegationDistributionAnalysis risk={risk} />

        {/* Advanced Data Accordion */}
        <AdvancedMetrics risk={risk} />
      </div>
    </ProGate>
  );
};