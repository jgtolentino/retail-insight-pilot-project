
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, DollarSign, Package, Target, Building2 } from "lucide-react";
import { formatCurrency, formatCurrencyDetailed } from "@/lib/currency";
import { useDataSource } from "@/hooks/useDataSource";
import { useEffect, useState } from "react";

interface KPICardsProps {
  dateRange: string;
}

export const KPICards = ({ dateRange }: KPICardsProps) => {
  const { getKPIs, isLoading, error } = useDataSource();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const kpiData = await getKPIs(dateRange);
      setData(kpiData);
    };
    fetchData();
  }, [dateRange, getKPIs]);

  if (isLoading) {
    return <div className="text-center p-8">Loading KPIs...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error loading KPIs: {error}</div>;
  }

  if (!data) {
    return <div className="text-center p-8">No KPI data available</div>;
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.total_revenue || data.totalRevenue || 0),
      change: "+15.2%",
      icon: DollarSign,
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      title: "Transactions",
      value: (data.transaction_count || data.transactionCount || 0).toLocaleString('en-PH'),
      change: "+12.8%",
      icon: ShoppingCart,
      color: "bg-gradient-to-r from-blue-600 to-blue-700",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Avg Basket Size",
      value: formatCurrencyDetailed(data.avg_basket_size || data.avgBasketSize || 0),
      change: "+8.5%",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      title: "Top Product",
      value: data.top_product || data.topProduct || "Alaska Evaporated Milk",
      change: "Best Seller",
      icon: Package,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
    {
      title: "Market Share",
      value: `${data.marketShare || 18.5}%`,
      change: "+2.1%",
      icon: Target,
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700"
    },
    {
      title: "Store Presence",
      value: `${(data.store_count || data.storeCount || 2850).toLocaleString()} stores`,
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
