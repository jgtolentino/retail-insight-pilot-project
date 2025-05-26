
import { useState } from "react";
import { DateFilter } from "@/components/DateFilter";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [dateRange, setDateRange] = useState("30");
  const { useKPIs } = useSupabaseData();
  const { data, isLoading, error } = useKPIs(dateRange);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Overview</h2>
            <p className="text-gray-600">Real-time analytics across Philippine retail locations</p>
          </div>
          <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {isLoading ? (
              <Card className="relative overflow-hidden border-0 shadow-xl">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ) : error || !data ? (
              <Card className="relative overflow-hidden border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">No data available yet</div>
                  <div className="text-sm text-gray-400">
                    Import your transaction data to see metrics
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Transactions</p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {(data.transactionCount || 0).toLocaleString('en-PH')}
                      </p>
                      <p className="text-sm font-semibold text-blue-700">
                        {data.transactionCount > 0 ? "+12.8%" : "No data"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
