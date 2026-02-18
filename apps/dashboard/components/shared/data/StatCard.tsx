import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CardContainer } from "./CardContainer";
import { InfoHeading } from "./InfoHeading";

export interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: number;
  tooltip?: string;
  isLoading?: boolean;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  tooltip,
  isLoading,
}: StatCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <CardContainer>
      <div className="flex flex-col justify-between w-full gap-[6px] h-full">
        <div className="flex justify-between w-full">
          <InfoHeading heading={title} info={tooltip} />
          <div className="h-fit w-10 text-muted-foreground flex my-auto items-center justify-end">
            {icon}
          </div>
        </div>
        <div className="flex ">
          <div className="text-[26px] text-foreground font-[500] tabular-nums">{value}</div>
        </div>
        {subtitle && (
          <div className="text-[14px] text-muted-foreground flex w-full">
            {subtitle}
          </div>
        )}
      </div>
    </CardContainer>
  );
};
