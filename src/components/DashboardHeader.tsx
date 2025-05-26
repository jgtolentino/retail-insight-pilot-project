
import { BarChart3, TrendingUp } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl shadow-lg">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
            TBWA Retail Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Philippine Market Performance Insights</p>
        </div>
      </div>
      
      <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
        <TrendingUp className="h-5 w-5 text-green-600" />
        <span className="text-green-700 font-semibold">Live Data</span>
      </div>
    </div>
  );
};
