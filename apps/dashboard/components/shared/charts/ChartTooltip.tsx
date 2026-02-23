"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (value: number) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (value: number) => `${value}`,
}: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <Card className="border border-border bg-card shadow-lg">
        <CardHeader className="p-2 border-b border-border">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 min-w-[150px] space-y-1">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium text-foreground">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-mono text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                {valueFormatter(item.value)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return null;
}
