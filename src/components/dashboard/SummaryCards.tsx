import { useFinance } from "@/context/FinanceContext";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function SummaryCards() {
  const { totalBalance, totalIncome, totalExpenses, transactions } = useFinance();
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

  const cards = [
    { label: "Total Balance", value: formatCurrency(totalBalance), icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Income", value: formatCurrency(totalIncome), icon: TrendingUp, color: "text-income", bg: "bg-income/10" },
    { label: "Total Expenses", value: formatCurrency(totalExpenses), icon: TrendingDown, color: "text-expense", bg: "bg-expense/10" },
    { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, icon: DollarSign, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="glass-card hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
