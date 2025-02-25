'use client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';

export default function Barchart({ data, chartConfig }) {
  const barColor = chartConfig.barColor;
  
  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: -20 }}
      >
        <XAxis type="number" dataKey="expense" hide />
        <YAxis
          dataKey="month"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0,3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel/>}
        />
        <Bar dataKey="expense" radius={5} fill={barColor} />
      </BarChart>
    </ChartContainer>
  );
}
