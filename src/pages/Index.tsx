import { FinanceProvider } from "@/context/FinanceContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { BalanceTrendChart } from "@/components/dashboard/BalanceTrendChart";
import { SpendingBreakdownChart } from "@/components/dashboard/SpendingBreakdownChart";
import { TransactionsSection } from "@/components/dashboard/TransactionsSection";
import { InsightsSection } from "@/components/dashboard/InsightsSection";

const Index = () => {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <DashboardHeader />
          <div className="space-y-6">
            <SummaryCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BalanceTrendChart />
              <SpendingBreakdownChart />
            </div>
            <TransactionsSection />
            <InsightsSection />
          </div>
        </div>
      </div>
    </FinanceProvider>
  );
};

export default Index;
