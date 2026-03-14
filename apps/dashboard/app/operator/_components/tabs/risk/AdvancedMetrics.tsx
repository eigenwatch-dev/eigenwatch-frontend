import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart3, Target, Activity } from 'lucide-react';
import { OperatorRiskProfile } from '@/types/risk.types';
import { DataRow } from './DataRow';

export const AdvancedMetrics = ({ risk }: { risk: OperatorRiskProfile }) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="advanced-metrics">
        <AccordionTrigger className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Advanced Metrics & Raw Data</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-8 pt-4">
            {/* System Flags */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                System Flags
              </h4>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Active Status</span>
                  <Badge variant={risk.flags.is_active ? 'default' : 'secondary'}>
                    {risk.flags.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Slashing History</span>
                  <Badge variant={risk.flags.has_been_slashed ? 'destructive' : 'default'}>
                    {risk.flags.has_been_slashed ? 'Has Slashing' : 'Clean'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Data Sufficiency</span>
                  <Badge variant={risk.flags.has_sufficient_data ? 'default' : 'secondary'}>
                    {risk.flags.has_sufficient_data ? 'Sufficient' : 'Limited'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* All Concentration Metrics */}
              <div className="space-y-6">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Concentration Metrics
                </h4>
                <Separator />
                
                {/* Delegation Concentration */}
                {risk.concentration.delegation && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground uppercase">Delegation Concentration</p>
                    <div className="space-y-2">
                      <DataRow 
                        label="Type" 
                        value={risk.concentration.delegation.concentration_type}
                        tooltip="Type of concentration being measured"
                      />
                      <DataRow 
                        label="HHI Value" 
                        value={risk.concentration.delegation.hhi_value}
                        tooltip="Herfindahl-Hirschman Index raw value"
                      />
                      <DataRow 
                        label="Gini Coefficient" 
                        value={risk.concentration.delegation.gini_coefficient}
                        tooltip="Statistical measure of distribution inequality"
                      />
                      <DataRow 
                        label="Top 1%" 
                        value={risk.concentration.delegation.top_1_percentage ? `${risk.concentration.delegation.top_1_percentage}%` : null}
                        tooltip="Percentage held by top 1% of delegators"
                      />
                      <DataRow 
                        label="Top 5%" 
                        value={risk.concentration.delegation.top_5_percentage ? `${risk.concentration.delegation.top_5_percentage}%` : null}
                        tooltip="Percentage held by top 5% of delegators"
                      />
                      <DataRow 
                        label="Top 10%" 
                        value={risk.concentration.delegation.top_10_percentage ? `${risk.concentration.delegation.top_10_percentage}%` : null}
                        tooltip="Percentage held by top 10% of delegators"
                      />
                    </div>
                  </div>
                )}

                {/* AVS Allocation Concentration */}
                {risk.concentration.allocation_by_avs && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground uppercase">AVS Allocation Concentration</p>
                    <div className="space-y-2">
                      <DataRow 
                        label="HHI Value" 
                        value={risk.concentration.allocation_by_avs.hhi_value}
                        tooltip="Concentration across different AVS allocations"
                      />
                      <DataRow 
                        label="Gini Coefficient" 
                        value={risk.concentration.allocation_by_avs.gini_coefficient}
                      />
                      <DataRow 
                        label="Total Entities" 
                        value={risk.concentration.allocation_by_avs.total_entities}
                        tooltip="Number of unique AVS allocations"
                      />
                      <DataRow 
                        label="Effective Entities" 
                        value={risk.concentration.allocation_by_avs.effective_entities}
                      />
                    </div>
                  </div>
                )}

                {/* Strategy Allocation Concentration */}
                {risk.concentration.allocation_by_strategy && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground uppercase">Strategy Allocation Concentration</p>
                    <div className="space-y-2">
                      <DataRow 
                        label="HHI Value" 
                        value={risk.concentration.allocation_by_strategy.hhi_value}
                        tooltip="Concentration across different strategies"
                      />
                      <DataRow 
                        label="Gini Coefficient" 
                        value={risk.concentration.allocation_by_strategy.gini_coefficient}
                      />
                      <DataRow 
                        label="Total Entities" 
                        value={risk.concentration.allocation_by_strategy.total_entities}
                        tooltip="Number of unique strategies"
                      />
                      <DataRow 
                        label="Effective Entities" 
                        value={risk.concentration.allocation_by_strategy.effective_entities}
                      />
                    </div>
                  </div>
                )}

                {!risk.concentration.delegation && !risk.concentration.allocation_by_avs && !risk.concentration.allocation_by_strategy && (
                  <p className="text-sm text-muted-foreground italic">No concentration data available</p>
                )}
              </div>

              {/* All Volatility Metrics */}
              <div className="space-y-6">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Volatility Metrics
                </h4>
                <Separator />
                
                {/* TVS Volatility */}
                {risk.volatility.tvs && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground uppercase">Total Value Staked (TVS) Volatility</p>
                    <div className="space-y-2">
                      <DataRow 
                        label="Type" 
                        value={risk.volatility.tvs.metric_type}
                        tooltip="Type of volatility metric being measured"
                      />
                      <DataRow 
                        label="7-Day Volatility" 
                        value={risk.volatility.tvs.volatility_7d}
                        tooltip="Standard deviation over 7-day period"
                      />
                      <DataRow 
                        label="30-Day Volatility" 
                        value={risk.volatility.tvs.volatility_30d}
                        tooltip="Standard deviation over 30-day period"
                      />
                      <DataRow 
                        label="90-Day Volatility" 
                        value={risk.volatility.tvs.volatility_90d}
                        tooltip="Standard deviation over 90-day period"
                      />
                      <DataRow 
                        label="Mean Value" 
                        value={risk.volatility.tvs.mean_value}
                        tooltip="Average value over the period"
                      />
                      <DataRow 
                        label="Coefficient of Variation" 
                        value={risk.volatility.tvs.coefficient_of_variation}
                        tooltip="Ratio of standard deviation to mean"
                      />
                      <DataRow 
                        label="Trend Direction" 
                        value={risk.volatility.tvs.trend_direction}
                        tooltip="Overall direction of the trend (STABLE, INCREASING, DECREASING)"
                      />
                      <DataRow 
                        label="Trend Strength" 
                        value={risk.volatility.tvs.trend_strength}
                        tooltip="Strength of the detected trend"
                      />
                      <DataRow 
                        label="Confidence Score" 
                        value={risk.volatility.tvs.confidence_score}
                        tooltip="Statistical confidence in the volatility calculation"
                      />
                    </div>
                  </div>
                )}

                {/* Delegators Volatility */}
                {risk.volatility.delegators && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground uppercase">Delegator Count Volatility</p>
                    <div className="space-y-2">
                      <DataRow 
                        label="7-Day Volatility" 
                        value={risk.volatility.delegators.volatility_7d}
                        tooltip="Volatility in number of delegators over 7 days"
                      />
                      <DataRow 
                        label="30-Day Volatility" 
                        value={risk.volatility.delegators.volatility_30d}
                        tooltip="Volatility in number of delegators over 30 days"
                      />
                      <DataRow 
                        label="90-Day Volatility" 
                        value={risk.volatility.delegators.volatility_90d}
                        tooltip="Volatility in number of delegators over 90 days"
                      />
                      <DataRow 
                        label="Mean Value" 
                        value={risk.volatility.delegators.mean_value}
                        tooltip="Average number of delegators"
                      />
                      <DataRow 
                        label="Trend Direction" 
                        value={risk.volatility.delegators.trend_direction}
                        tooltip="Trend in delegator count"
                      />
                      <DataRow 
                        label="Confidence Score" 
                        value={risk.volatility.delegators.confidence_score}
                        tooltip="Confidence in the delegator volatility calculation"
                      />
                    </div>
                  </div>
                )}

                {!risk.volatility.tvs && !risk.volatility.delegators && (
                  <p className="text-sm text-muted-foreground italic">No volatility data available</p>
                )}
              </div>
            </div>

            {/* Raw Delegation Metrics */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                Raw Delegation Metrics
              </h4>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DataRow
                  label="HHI (Raw)"
                  value={risk.metrics.delegation.hhi.toFixed(8)}
                  tooltip="Raw Herfindahl-Hirschman Index value"
                />
                <DataRow 
                  label="30d Volatility (Raw)" 
                  value={risk.metrics.delegation.volatility_30d.toExponential(4)}
                  tooltip="Raw 30-day volatility in scientific notation"
                />
                <DataRow 
                  label="Growth Rate (Raw)" 
                  value={risk.metrics.delegation.growth_rate_30d.toFixed(8)}
                  tooltip="Raw 30-day growth rate"
                />
                <DataRow 
                  label="Distribution CV (Raw)" 
                  value={risk.metrics.delegation.distribution_cv.toFixed(8)}
                  tooltip="Raw Coefficient of Variation for distribution"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
