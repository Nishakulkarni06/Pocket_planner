import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function BalanceTrendChart() {
  const { transactions } = useFinance();

  const chartData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dailyMap = new Map<string, { income: number; expense: number }>();

    sorted.forEach((t) => {
      const day = t.date;
      const existing = dailyMap.get(day) || { income: 0, expense: 0 };
      if (t.type === "income") existing.income += t.amount;
      else existing.expense += t.amount;
      dailyMap.set(day, existing);
    });

    let runningBalance = 0;
    return Array.from(dailyMap.entries()).map(([date, { income, expense }]) => {
      runningBalance += income - expense;
      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        balance: Math.round(runningBalance * 100) / 100,
        income,
        expense,
      };
    });
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Balance Trend</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">No data available</CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Balance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Balance"]}
            />
            <Area type="monotone" dataKey="balance" stroke="hsl(210, 100%, 50%)" fill="url(#balanceGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
