import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PiggyBank, BarChart3 } from "lucide-react";

export function InsightsSection() {
  const { transactions, totalIncome, totalExpenses } = useFinance();

  const insights = useMemo(() => {
    // Highest spending category
    const catMap = new Map<string, number>();
    transactions.filter(t => t.type === "expense").forEach(t => catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount));
    const sortedCats = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);
    const highestCat = sortedCats[0];

    // Monthly comparison
    const monthlyData = new Map<string, { income: number; expense: number }>();
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      const m = monthlyData.get(month) || { income: 0, expense: 0 };
      if (t.type === "income") m.income += t.amount; else m.expense += t.amount;
      monthlyData.set(month, m);
    });
    const months = Array.from(monthlyData.entries()).sort((a, b) => b[0].localeCompare(a[0]));

    let monthCompare = "";
    if (months.length >= 2) {
      const diff = months[0][1].expense - months[1][1].expense;
      const pct = months[1][1].expense > 0 ? ((diff / months[1][1].expense) * 100).toFixed(1) : "0";
      monthCompare = diff > 0
        ? `Spending increased by ${pct}% compared to last month`
        : `Spending decreased by ${Math.abs(Number(pct))}% compared to last month`;
    }

    // Average transaction
    const avgExpense = transactions.filter(t => t.type === "expense").length > 0
      ? totalExpenses / transactions.filter(t => t.type === "expense").length
      : 0;

    return { highestCat, monthCompare, avgExpense, topCategories: sortedCats.slice(0, 3) };
  }, [transactions, totalIncome, totalExpenses]);

  const cards = [
    {
      icon: TrendingUp,
      title: "Highest Spending",
      value: insights.highestCat ? `${insights.highestCat[0]}` : "N/A",
      detail: insights.highestCat ? `$${insights.highestCat[1].toLocaleString()} total` : "",
      color: "text-expense",
      bg: "bg-expense/10",
    },
    {
      icon: BarChart3,
      title: "Monthly Trend",
      value: insights.monthCompare || "Not enough data",
      detail: "",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: PiggyBank,
      title: "Avg. Expense",
      value: `$${insights.avgExpense.toFixed(2)}`,
      detail: "Per transaction",
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${card.bg} shrink-0`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                  <p className="font-semibold text-sm leading-snug">{card.value}</p>
                  {card.detail && <p className="text-xs text-muted-foreground mt-0.5">{card.detail}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {insights.topCategories.length > 0 && (
        <Card className="glass-card mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.topCategories.map(([cat, amount], i) => {
                const max = insights.topCategories[0][1];
                const pct = (amount / max) * 100;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{cat}</span>
                      <span className="text-muted-foreground">${amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: ["hsl(210,100%,50%)", "hsl(160,70%,42%)", "hsl(38,92%,50%)"][i],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
