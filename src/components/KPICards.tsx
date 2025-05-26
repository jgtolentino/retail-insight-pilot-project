
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react";
import { mockData } from "@/data/mockData";

interface KPICardsProps {
  dateRange: string;
}

export const KPICards = ({ dateRange }: KPICardsProps) => {
  const data = mockData.getKPIs(dateRange);

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${data.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      title: "Transactions",
      value: data.transactionCount.toLocaleString(),
      change: "+8.3%",
      icon: ShoppingCart,
      color: "bg-gradient-to-r from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Avg Basket Size",
      value: `$${data.avgBasketSize.toFixed(2)}`,
      change: "+5.1%",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      title: "Top Product",
      value: data.topProduct,
      change: "Best Seller",
      icon: Package,
      color: "bg-gradient-to-r from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
