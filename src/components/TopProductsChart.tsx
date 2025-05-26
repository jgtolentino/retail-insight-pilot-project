
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { azureSqlService } from "@/services/azureSqlService";
import { useState, useEffect } from "react";

interface TopProductsChartProps {
  dateRange: string;
}

export const TopProductsChart = ({ dateRange }: TopProductsChartProps) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      setLoading(true);
      try {
        const productsData = await azureSqlService.getTopProducts(dateRange);
        const formattedData = productsData.map(product => ({
          name: product.product_name,
          sales: product.sales_amount
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching top products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [dateRange]);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="text-xl font-bold text-gray-800">
          Top 10 Products {loading && "(Loading...)"}
        </CardTitle>
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
