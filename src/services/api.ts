// API Service for connecting to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const USE_AZURE_SQL = import.meta.env.VITE_USE_AZURE_SQL === 'true';

// Import Azure SQL service if needed
import { azureSqlService } from './azureSqlService';

export interface DashboardData {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    activeBrands: number;
    growthRate: number;
  };
  transactions: Array<{
    id: number;
    brand: string;
    location: string;
    amount: number;
    date: string;
    category: string;
  }>;
  brandPerformance: Array<{
    brand: string;
    revenue: number;
    orders: number;
  }>;
}

export const apiService = {
  // Fetch all dashboard data
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Transform backend data to match frontend expectations
  getKPIs: async (dateRange: string) => {
    try {
      // Use Azure SQL if configured
      if (USE_AZURE_SQL) {
        const azureData = await azureSqlService.getKPIs(dateRange);
        return {
          totalRevenue: azureData.total_revenue,
          transactionCount: azureData.transaction_count,
          avgBasketSize: azureData.avg_basket_size,
          topProduct: azureData.top_product,
          marketShare: azureData.market_share,
          storeCount: azureData.store_count
        };
      }
      
      // Otherwise use Express backend
      const data = await apiService.getDashboardData();
      const multiplier = dateRange === "7" ? 0.3 : dateRange === "30" ? 1 : 3;
      
      return {
        totalRevenue: Math.round(data.kpis.totalRevenue * multiplier),
        transactionCount: data.kpis.totalOrders,
        avgBasketSize: data.kpis.totalRevenue / data.kpis.totalOrders,
        topProduct: data.brandPerformance[0]?.brand || "Alaska Milk",
        marketShare: data.kpis.growthRate || 18.5, // Using growth rate as market share for now
        storeCount: data.kpis.activeBrands * 570 || 2850 // Estimate based on brands
      };
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('Using fallback data:', error);
      return {
        totalRevenue: 2500000,
        transactionCount: 150,
        avgBasketSize: 16666.67,
        topProduct: "Alaska Milk",
        marketShare: 18.5,
        storeCount: 2850
      };
    }
  },

  getDailyTrends: async (dateRange: string) => {
    try {
      const data = await apiService.getDashboardData();
      const days = parseInt(dateRange);
      const trends = [];
      
      // Group transactions by date
      const transactionsByDate = data.transactions.reduce((acc, tx) => {
        const date = tx.date.split('T')[0];
        if (!acc[date]) {
          acc[date] = { transactions: 0, revenue: 0 };
        }
        acc[date].transactions++;
        acc[date].revenue += tx.amount;
        return acc;
      }, {} as Record<string, { transactions: number; revenue: number }>);
      
      // Generate trend data for requested days
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = transactionsByDate[dateStr] || { transactions: 0, revenue: 0 };
        
        trends.push({
          date: dateStr,
          transactions: dayData.transactions || Math.round(Math.random() * 50 + 10),
          revenue: dayData.revenue || Math.round(Math.random() * 50000 + 10000)
        });
      }
      
      return trends;
    } catch (error) {
      console.warn('Using fallback trend data:', error);
      // Return some default trend data
      const days = parseInt(dateRange);
      const data = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          transactions: Math.round(Math.random() * 50 + 10),
          revenue: Math.round(Math.random() * 50000 + 10000)
        });
      }
      
      return data;
    }
  },

  getTopProducts: async (dateRange: string) => {
    try {
      const data = await apiService.getDashboardData();
      const multiplier = dateRange === "7" ? 0.3 : dateRange === "30" ? 1 : 3;
      
      return data.brandPerformance.map(brand => ({
        name: brand.brand,
        sales: Math.round(brand.revenue * multiplier)
      }));
    } catch (error) {
      console.warn('Using fallback product data:', error);
      return [
        { name: "Alaska", sales: 5450 },
        { name: "Oishi", sales: 2250 },
        { name: "Del Monte", sales: 5450 },
        { name: "Nestle", sales: 3200 },
        { name: "Unilever", sales: 2800 }
      ];
    }
  },

  getRecentTransactions: async () => {
    try {
      const data = await apiService.getDashboardData();
      
      return data.transactions.slice(0, 10).map(tx => ({
        id: `TXN${tx.id}`,
        store: tx.location,
        amount: tx.amount,
        items: Math.floor(Math.random() * 8) + 1, // Random for now
        date: new Date(tx.date).toLocaleString(),
        status: "Completed"
      }));
    } catch (error) {
      console.warn('Using fallback transaction data:', error);
      return [];
    }
  },

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};

// Export as mockData for compatibility
export const mockData = apiService;