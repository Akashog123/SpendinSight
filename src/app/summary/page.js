'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { DollarSign, BarChart, Percent, ShoppingBag, Wallet, TrendingUp } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter
} from '@/components/ui/card';
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent
} from '@/components/ui/chart';
import { AreaChart, Area, CartesianGrid, XAxis, BarChart as ReBarChart, Bar } from 'recharts';

export default function Summary() {
  const [transactions, setTransactions] = useState([]);
  const [budgetsData, setBudgetsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    const currentYear = new Date().getFullYear();
    const fetchBudgets = async () => {
      try {
        const res = await fetch(`/api/budgets?year=${currentYear}`);
        const data = await res.json();
        setBudgetsData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBudgets();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date();
  const currentMonthStr = format(currentDate, "MMM-yyyy");
  const previousDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const previousMonthStr = format(previousDate, "MMM-yyyy");

  const totalSpentCurrent = transactions
    .filter(tx => format(new Date(tx.date), "MMM-yyyy") === currentMonthStr)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalSpentPrevious = transactions
    .filter(tx => format(new Date(tx.date), "MMM-yyyy") === previousMonthStr)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlySums = {};
  transactions.forEach(tx => {
    const txMonth = format(new Date(tx.date), "MMM-yyyy");
    const diff = (currentDate.getFullYear() - new Date(tx.date).getFullYear()) * 12 + (currentDate.getMonth() - new Date(tx.date).getMonth());
    if(diff >= 0 && diff < 12) {
      monthlySums[txMonth] = (monthlySums[txMonth] || 0) + tx.amount;
    }
  });
  const totalLast12 = Object.values(monthlySums).reduce((acc, val) => acc + val, 0);
  const averageMonthlySpend = totalLast12 / 12;

  const currentTxns = transactions.filter(tx => format(new Date(tx.date), "MMM-yyyy") === currentMonthStr);
  const categorySums = {};
  currentTxns.forEach(tx => {
    categorySums[tx.category] = (categorySums[tx.category] || 0) + tx.amount;
  });
  let largestCategory = "N/A";
  let maxCategoryAmount = 0;
  Object.entries(categorySums).forEach(([cat, sum]) => {
    if(sum > maxCategoryAmount) {
      maxCategoryAmount = sum;
      largestCategory = cat;
    }
  });

  const budgetsCurrent = budgetsData.filter(b => b.month === currentMonthStr);
  const totalBudget = budgetsCurrent.reduce((sum, b) => sum + b.budget, 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpentCurrent / totalBudget) * 100 : 0;
  const unusedBudget = totalBudget > totalSpentCurrent ? totalBudget - totalSpentCurrent : 0;

  // Compute cumulative expense data over the last 12 months:
  const cumulativeData = [];
  let cumulativeTotal = 0;
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthKey = format(d, "MMM-yyyy");
    const monthLabel = format(d, "MMM");
    const monthlyTotal = monthlySums[monthKey] || 0;
    cumulativeTotal += monthlyTotal;
    cumulativeData.push({ month: monthLabel, total: cumulativeTotal });
  }

  // Chart config for cumulative area chart (one area)
  const cumChartConfig = {
    total: {
      label: "Expenses:  ₹",
      color: "hsl(var(--chart-1))"
    }
  };

  // Compute budget analysis data for each category
  const categoriesList = ['Food', 'Travel', 'Entertainment', 'Utilities', 'Other'];
  const budgetAnalysisData = categoriesList.map(cat => {
    const actual = currentTxns.filter(tx => tx.category === cat).reduce((sum, tx) => sum + tx.amount, 0);
    const budgetDoc = budgetsCurrent.find(b => b.category === cat);
    const budgetValue = budgetDoc ? budgetDoc.budget : 0;
    return { category: cat, actual, budget: budgetValue };
  });

  // New config for budget analysis stacked bar chart
  const barChartConfig = {
    actual: {
      label: "Actual",
      color: "hsl(var(--chart-1))"
    },
    budget: {
      label: "Budget",
      color: "hsl(var(--chart-2))"
    }
  };

  // Compute insight for budget analysis
  const overBudgetItems = budgetAnalysisData
    .filter(item => item.budget > 0 && item.actual > item.budget)
    .map(item => ({
      ...item,
      diffCash: item.actual - item.budget,
    }));
  
  let budgetInsight = "";
  if (overBudgetItems.length) {
    const categories = overBudgetItems.map(item => item.category).join(", ");
    const totalExceeded = overBudgetItems.reduce((sum, item) => sum + item.diffCash, 0);
    budgetInsight = `${categories} exceeded budget by a total of ₹${totalExceeded.toFixed(2)}.`;
  } else {
    budgetInsight = "All categories are currently within budget.";
  }
  
  return (
    <div className="container mx-auto p-4 max-w-screen-2xl">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <Card className="p-4 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-sm">Total Spent</CardTitle>
                <CardDescription className="text-xs">
                  {currentMonthStr}: ₹{totalSpentCurrent.toFixed(2)}<br/>
                  Previous ({previousMonthStr}): ₹{totalSpentPrevious.toFixed(2)}
                </CardDescription>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-2">
              <BarChart className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-sm">Avg Monthly Spend</CardTitle>
                <CardDescription className="text-xs">
                  ₹{averageMonthlySpend.toFixed(2)}
                </CardDescription>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-2">
              <Percent className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-sm">Budget Utilization</CardTitle>
                <CardDescription className="text-xs">
                  {totalBudget > 0 ? budgetUtilization.toFixed(1) : 0}% used for this month.
                </CardDescription>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-sm">Largest Category</CardTitle>
                <CardDescription className="text-xs">
                  {largestCategory} (₹{maxCategoryAmount.toFixed(2)})
                </CardDescription>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-sm">Unused Budget</CardTitle>
                <CardDescription className="text-xs">
                  ₹{unusedBudget.toFixed(2)} remaining
                </CardDescription>
              </div>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader className="-mb-6">
                  <CardTitle>Cumulative Expenses</CardTitle>
                  <CardDescription>
                    Long-term spending trajectory over the last 12 months.
                  </CardDescription>
              </CardHeader>
              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={cumChartConfig} className="aspect-auto h-[250px] w-full">
                  <AreaChart data={cumulativeData}>
                    <defs>
                      <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => value}
                          indicator="dot"
                        />
                      }
                    />
                    <Area
                      dataKey="total"
                      type="monotone"
                      fill="url(#fillTotal)"
                      stroke="var(--color-total)"
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="-mb-6">
                <CardTitle>Budget Analysis for {currentMonthStr}</CardTitle>
                <CardDescription>Category-wise Actual vs Budget</CardDescription>
              </CardHeader>
              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={barChartConfig} className="aspect-auto h-[250px] w-full">
                  <ReBarChart data={budgetAnalysisData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="actual"
                      stackId="a"
                      fill="var(--color-actual)"
                      radius={[0, 0, 4, 4]}
                    />
                    <Bar
                      dataKey="budget"
                      stackId="a"
                      fill="var(--color-budget)"
                      radius={[4, 4, 0, 0]}
                    />
                  </ReBarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="-mt-3 flex-col items-start text-sm">
                <div className="flex gap-2 font-medium leading-none">
                  {overBudgetItems.length > 0 && <TrendingUp className="h-4 w-4" />}
                  <span>{budgetInsight}</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
