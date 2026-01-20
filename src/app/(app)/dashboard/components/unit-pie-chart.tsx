'use client';

import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import type { Member, Unit } from '@/lib/types';
import { useMemo } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

interface UnitSubscriptionChartProps {
  members: Member[];
  units: Unit[];
}

export function UnitSubscriptionChart({ members, units }: UnitSubscriptionChartProps) {
  const chartData = useMemo(() => {
    return units
      .map(unit => ({
        unit: unit.name,
        members: members.filter(member => member.unitId === unit.id && member.status === 'Opened').length,
        fill: '', // a placeholder
      }))
      .filter(d => d.members > 0);
  }, [members, units]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    chartData.forEach((data, index) => {
      config[data.unit] = {
        label: data.unit,
        color: `hsl(var(--chart-${index + 1}))`,
      };
      data.fill = `var(--color-${data.unit})`;
    });
    return config;
  }, [chartData]);


  if (chartData.length === 0) {
    return (
        <div className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">No active members to display.</p>
        </div>
    )
  }

  return (
     <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={chartData}
                    dataKey="members"
                    nameKey="unit"
                    innerRadius={50}
                    strokeWidth={5}
                >
                    {chartData.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={chartConfig[entry.unit]?.color}
                    />
                    ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent nameKey="unit" />} />
            </PieChart>
        </ResponsiveContainer>
    </ChartContainer>
  );
}
