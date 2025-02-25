"use client";
import * as React from "react";
import { Label, Pie, PieChart, Sector, Cell } from "recharts";
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categoryChartConfig = {
  Food: { label: "Food", color: "hsl(var(--chart-1))" },
  Travel: { label: "Travel", color: "hsl(var(--chart-2))" },
  Entertainment: { label: "Entertainment", color: "hsl(var(--chart-3))" },
  Utilities: { label: "Utilities", color: "hsl(var(--chart-4))" },
  Other: { label: "Other", color: "hsl(var(--chart-5))" },
};

export default function PieChartInteractive({ data }) {
  const categories = data && data.length ? data.map(item => item.category) : [];
  const uniqueCategories = [...new Set(categories)];
  const initialCategory = uniqueCategories[0] || "Food";
  const [activeCategory, setActiveCategory] = React.useState(initialCategory);

  const activeIndex = React.useMemo(() => {
    return data.findIndex((item) => item.category === activeCategory);
  }, [activeCategory, data]);

  return (
    <div className="mt-2">
      <div className="flex flex-row">
        <div className="grid gap-1">
          <h3 className="mt-4 text-lg font-medium">Category-wise Spending</h3>
          <h3 className="font-light text-sm subpixel-antialiased">Category-wise spending over last 12 months</h3>
        </div>
      </div>
      <div className="flex flex-1 justify-center -mb-12 mt-3">
        <ChartStyle id="pie-interactive" config={categoryChartConfig} />
        <ChartContainer id="pie-interactive" config={categoryChartConfig} className="aspect-square w-full max-w-[330px]">
          <PieChart>
            <ChartTooltip cursor={false} className="bg-card" content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="expense"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                </g>
              )}
            >
              {data.map((entry, index) => {
                const config = categoryChartConfig[entry.category];
                return <Cell key={`cell-${index}`} fill={config ? config.color : "#8884d8"} />;
              })}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                          ₹{data[activeIndex] ? data[activeIndex].expense.toLocaleString() : 0}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <div>
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="mt-1 align-left justify-start w-30 rounded-lg" aria-label="Select a category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {uniqueCategories.map((cat) => {
                const config = categoryChartConfig[cat];
                if (!config) return null;
                return (
                  <SelectItem key={cat} value={cat} className="rounded-lg [&_span]:flex">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex h-3 w-3 shrink-0 rounded-lg" style={{ backgroundColor: config.color }} />
                      {config.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
    </div>
  );
}
