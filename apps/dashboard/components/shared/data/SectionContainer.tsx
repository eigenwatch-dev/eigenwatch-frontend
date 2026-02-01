import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SectionContainer({
  children,
  heading,
  info,
}: {
  children: React.ReactNode;
  heading: string;
  info?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow p-[18px] rounded-[11.03px] w-full">
      <CardHeader className="p-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-muted-foreground">{heading}</CardTitle>
          {info && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground/70 cursor-help hover:text-muted-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs font-normal">{info}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-full">{children}</CardContent>
    </Card>
  );
}
