
import { useState } from "react";
import { KPICards } from "@/components/KPICards";
import { TopProductsChart } from "@/components/TopProductsChart";
import { TransactionChart } from "@/components/TransactionChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { DateFilter } from "@/components/DateFilter";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingUp } from "lucide-react";

const Index = () => {
  const [dateRange, setDateRange] = useState("30");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        
        {/* Data Success Notice */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Data Successfully Imported
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 mb-2">
                  Your Philippine retail market data has been successfully imported! 
                  Dashboard now showing real FMCG analytics with TBWA brands vs competitors.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  <div className="text-green-600">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    50+ Transactions
                  </div>
                  <div className="text-green-600">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    19 Brands
                  </div>
                  <div className="text-green-600">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    44+ SKUs
                  </div>
                  <div className="text-green-600">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    15 Stores
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Overview</h2>
            <p className="text-gray-600">Real-time analytics across Philippine retail locations</p>
          </div>
          <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        <div className="space-y-8">
          <KPICards dateRange={dateRange} />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <TopProductsChart dateRange={dateRange} />
            <TransactionChart dateRange={dateRange} />
          </div>
          
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};

export default Index;
