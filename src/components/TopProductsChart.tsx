
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDataSource } from "@/hooks/useDataSource";
import { useEffect, useState } from "react";

interface TopProductsChartProps {
  dateRange: string;
}

export const TopProductsChart = ({ dateRange }: TopProductsChartProps) => {
  const { getTopProducts, isLoading, error } = useDataSource();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const productsData = await getTopProducts(dateRange);
      setData(productsData);
    };
    fetchData();
  }, [dateRange, getTopProducts]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6 flex items-center justify-center h-80">
          <div>Loading top products...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="text-xl font-bold text-gray-800">Top 10 Products</CardTitle>
        {error && <div className="text-sm text-orange-600">Using fallback data</div>}
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" stroke="#64748b" fontSize={12} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={12}
              width={100}
            />
            <Tooltip 
              formatter={(value: number) => [value.toLocaleString(), 'Sales']}
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="sales" 
              fill="url(#gradient)"
              radius={[0, 4, 4, 0]}
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
