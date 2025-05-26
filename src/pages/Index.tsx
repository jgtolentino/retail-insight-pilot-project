
import { DashboardHeader } from "@/components/DashboardHeader";
import { KPICards } from "@/components/KPICards";
import { TransactionChart } from "@/components/TransactionChart";
import { TopProductsChart } from "@/components/TopProductsChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { DateFilter } from "@/components/DateFilter";
import { useState } from "react";

const Index = () => {
  const [dateRange, setDateRange] = useState("30");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <DashboardHeader />
        
        <div className="mb-8">
          <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>
        
        <div className="space-y-8">
          <KPICards dateRange={dateRange} />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TransactionChart dateRange={dateRange} />
            <TopProductsChart dateRange={dateRange} />
          </div>
          
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};

export default Index;
