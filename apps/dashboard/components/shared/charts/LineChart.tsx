"use client";

import {
  Line,
  LineChart as RechartsLineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";

interface LineChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: number;
  className?: string;
}

export function LineChart({
  data,
  categories,
  index,
  colors = ["var(--primary)"],
  valueFormatter,
  height = 300,
  className,
}: LineChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#FFFFFF0D"
            vertical={false}
          />
          <XAxis
            dataKey={index}
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
            tickMargin={8}
            width={80}
          />
          <Tooltip
            content={<ChartTooltip valueFormatter={valueFormatter} />}
            cursor={{
              stroke: "var(--muted-foreground)",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />
          {categories.map((category, i) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[i % colors.length]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
