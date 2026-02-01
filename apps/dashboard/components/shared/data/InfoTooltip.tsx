import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  info: string;
  detailed?: string;
}

export function InfoTooltip({ info, detailed }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger className="">
          <Info className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{info}</p>
          {detailed && (
            <p className="text-xs text-muted-foreground mt-1">{detailed}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
