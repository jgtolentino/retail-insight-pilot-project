
import { useState } from "react";
import { KPICards } from "@/components/KPICards";
import { TopProductsChart } from "@/components/TopProductsChart";
import { TransactionChart } from "@/components/TransactionChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { DateFilter } from "@/components/DateFilter";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [dateRange, setDateRange] = useState("30");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        
        {/* Data Import Notice */}
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Database className="h-5 w-5" />
              Database Ready for Data Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-700 mb-2">
                  Your Supabase database schema is now set up and ready for data migration from Azure SQL.
                </p>
                <p className="text-sm text-amber-600">
                  To populate with sample data, run the generated Python script and SQL inserts.
                </p>
              </div>
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
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
