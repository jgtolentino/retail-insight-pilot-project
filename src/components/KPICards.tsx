
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, DollarSign, Package, Target, Building2 } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatCurrencyDetailed } from "@/lib/currency";

interface KPICardsProps {
  dateRange: string;
}

export const KPICards = ({ dateRange }: KPICardsProps) => {
  const { useKPIs } = useSupabaseData();
  const { data, isLoading, error } = useKPIs(dateRange);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden border-0 shadow-xl">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-full">
          <CardContent className="p-6 text-center text-red-500">
            Failed to load KPI data. Please try again later.
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      change: "+15.2%",
      icon: DollarSign,
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      title: "Transactions",
      value: data.transactionCount.toLocaleString('en-PH'),
      change: "+12.8%",
      icon: ShoppingCart,
      color: "bg-gradient-to-r from-blue-600 to-blue-700",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Avg Basket Size",
      value: formatCurrencyDetailed(data.avgBasketSize),
      change: "+8.5%",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      title: "Top Product",
      value: data.topProduct,
      change: "Best Seller",
      icon: Package,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
    {
      title: "Market Share",
      value: `${data.marketShare}%`,
      change: "+2.1%",
      icon: Target,
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700"
    },
    {
      title: "Store Presence",
      value: `${data.storeCount.toLocaleString()} stores`,
      change: "+125 stores",
      icon: Building2,
      color: "bg-gradient-to-r from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardContent className={`p-6 ${kpi.bgColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                <p className={`text-sm font-semibold ${kpi.textColor}`}>{kpi.change}</p>
              </div>
              <div className={`p-3 rounded-xl ${kpi.color} shadow-lg`}>
                <kpi.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
