import { CardContainer } from '@/components/shared/data/CardContainer';
import { InfoHeading } from '@/components/shared/data/InfoHeading';

export const MetricCard = ({
  label,
  value,
  context,
  badge,
  tooltip,
  rawValue,
}: {
  label: string;
  value: string | React.ReactNode;
  context?: string;
  badge?: React.ReactNode;
  tooltip?: string;
  rawValue?: string;
}) => {
  return (
    <CardContainer>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <InfoHeading heading={label} info={tooltip} />
          {badge}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xl sm:text-[26px] font-[500] text-foreground">{value}</div>
          {context && (
            <div className="text-sm text-muted-foreground">{context}</div>
          )}
          {rawValue && (
            <div className="text-xs font-mono text-muted-foreground/70">
              Raw: {rawValue}
            </div>
          )}
        </div>
      </div>
    </CardContainer>
  );
};
