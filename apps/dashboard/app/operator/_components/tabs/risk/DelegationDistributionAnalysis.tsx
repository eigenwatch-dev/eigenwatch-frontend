import { SectionContainer } from '@/components/shared/data/SectionContainer';
import { Separator } from '@/components/ui/separator';
import { OperatorRiskProfile } from '@/types/risk.types';
import { ConcentrationBar } from './ConcentrationBar';
import { DataRow } from './DataRow';
import { formatDate } from './utils';

export const DelegationDistributionAnalysis = ({ risk }: { risk: OperatorRiskProfile }) => {
  if (!risk.concentration.delegation) return null;

  return (
    <SectionContainer heading="Delegation Distribution Analysis">
      <div className="space-y-4 mt-6">
        <ConcentrationBar
          value={parseFloat(risk.concentration.delegation.top_1_percentage || '0') / 100}
          label="Top 1% of Delegators"
          color={parseFloat(risk.concentration.delegation.top_1_percentage || '0') > 30 ? 'bg-red-500' : 'bg-green-500'}
        />
        <ConcentrationBar
          value={parseFloat(risk.concentration.delegation.top_5_percentage || '0') / 100}
          label="Top 5% of Delegators"
          color={parseFloat(risk.concentration.delegation.top_5_percentage || '0') > 50 ? 'bg-yellow-500' : 'bg-green-500'}
        />
        <ConcentrationBar
          value={parseFloat(risk.concentration.delegation.top_10_percentage || '0') / 100}
          label="Top 10% of Delegators"
          color={parseFloat(risk.concentration.delegation.top_10_percentage || '0') > 70 ? 'bg-orange-500' : 'bg-blue-500'}
        />
        <Separator className="my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DataRow 
            label="Total Entities" 
            value={risk.concentration.delegation.total_entities}
            tooltip="Total number of unique delegators"
          />
          <DataRow 
            label="Effective Entities" 
            value={risk.concentration.delegation.effective_entities}
            tooltip="Effective number of delegators after accounting for concentration. Higher is better."
          />
          <DataRow 
            label="Gini Coefficient" 
            value={risk.concentration.delegation.gini_coefficient}
            tooltip="Measures inequality in delegation distribution (0 = perfect equality, 1 = perfect inequality)"
          />
          <DataRow 
            label="Last Updated" 
            value={formatDate(risk.concentration.delegation.date)}
            tooltip="Date of last concentration metric calculation"
          />
        </div>
      </div>
    </SectionContainer>
  );
};
