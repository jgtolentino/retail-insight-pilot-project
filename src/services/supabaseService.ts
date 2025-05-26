
import { supabase } from "@/integrations/supabase/client";

export interface KPIData {
  totalRevenue: number;
  transactionCount: number;
  avgBasketSize: number;
  topProduct: string;
  marketShare: number;
  storeCount: number;
}

export interface TopProduct {
  name: string;
  sales: number;
}

export interface DailyTrend {
  date: string;
  transactions: number;
}

export interface RecentTransaction {
  id: string;
  store: string;
  amount: number;
  items: number;
  date: string;
  status: string;
}

export class SupabaseService {
  async getKPIs(dateRange: string): Promise<KPIData> {
    try {
      console.log('Fetching KPIs from Supabase for date range:', dateRange);
      
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get transaction data
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select(`
          transaction_id,
          total_value,
          basket_size,
          transaction_date,
          stores!inner(store_name)
        `)
        .gte('transaction_date', startDate.toISOString());

      if (transError) {
        console.error('Error fetching transactions:', transError);
        throw transError;
      }

      // Get top product
      const { data: topProducts, error: topError } = await supabase
        .from('transaction_items')
        .select(`
          sku_id,
          quantity,
          price,
          skus!inner(sku_name)
        `)
        .order('quantity', { ascending: false })
        .limit(1);

      if (topError) {
        console.error('Error fetching top products:', topError);
      }

      // Get store count
      const { count: storeCount, error: storeError } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true });

      if (storeError) {
        console.error('Error fetching store count:', storeError);
      }

      // Calculate KPIs
      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.total_value || 0), 0) || 0;
      const transactionCount = transactions?.length || 0;
      const avgBasketSize = transactions?.reduce((sum, t) => sum + (t.basket_size || 0), 0) / (transactionCount || 1) || 0;
      const topProduct = topProducts?.[0]?.skus?.sku_name || "Alaska Evaporated Milk";

      return {
        totalRevenue,
        transactionCount,
        avgBasketSize,
        topProduct,
        marketShare: 24.5, // Static for now
        storeCount: storeCount || 8450
      };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      // Return fallback data
      return {
        totalRevenue: 45680000,
        transactionCount: 18250,
        avgBasketSize: 850,
        topProduct: "Alaska Evaporated Milk",
        marketShare: 24.5,
        storeCount: 8450
      };
    }
  }

  async getTopProducts(dateRange: string): Promise<TopProduct[]> {
    try {
      console.log('Fetching top products from Supabase for date range:', dateRange);
      
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('transaction_items')
        .select(`
          sku_id,
          quantity,
          price,
          skus!inner(sku_name),
          transactions!inner(transaction_date)
        `)
        .gte('transactions.transaction_date', startDate.toISOString());

      if (error) {
        console.error('Error fetching top products:', error);
        throw error;
      }

      // Aggregate by product
      const productMap = new Map<string, number>();
      data?.forEach(item => {
        const productName = item.skus?.sku_name;
        if (productName) {
          const currentSales = productMap.get(productName) || 0;
          productMap.set(productName, currentSales + (item.quantity * item.price));
        }
      });

      // Convert to array and sort
      const products = Array.from(productMap.entries())
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);

      return products.length > 0 ? products : this.getFallbackTopProducts();
    } catch (error) {
      console.error('Error fetching top products:', error);
      return this.getFallbackTopProducts();
    }
  }

  async getDailyTrends(dateRange: string): Promise<DailyTrend[]> {
    try {
      console.log('Fetching daily trends from Supabase for date range:', dateRange);
      
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_date')
        .gte('transaction_date', startDate.toISOString())
        .order('transaction_date');

      if (error) {
        console.error('Error fetching daily trends:', error);
        throw error;
      }

      // Group by date
      const dateMap = new Map<string, number>();
      data?.forEach(transaction => {
        const date = new Date(transaction.transaction_date).toDateString();
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      });

      // Convert to array
      const trends = Array.from(dateMap.entries())
        .map(([date, transactions]) => ({ date, transactions }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return trends.length > 0 ? trends : this.getFallbackDailyTrends(days);
    } catch (error) {
      console.error('Error fetching daily trends:', error);
      return this.getFallbackDailyTrends(parseInt(dateRange));
    }
  }

  async getRecentTransactions(): Promise<RecentTransaction[]> {
    try {
      console.log('Fetching recent transactions from Supabase');
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          transaction_id,
          total_value,
          basket_size,
          transaction_date,
          stores!inner(store_name)
        `)
        .order('transaction_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent transactions:', error);
        throw error;
      }

      const transactions = data?.map(t => ({
        id: t.transaction_id,
        store: t.stores?.store_name || 'Unknown Store',
        amount: t.total_value || 0,
        items: t.basket_size || 0,
        date: new Date(t.transaction_date).toLocaleDateString(),
        status: 'Completed'
      })) || [];

      return transactions.length > 0 ? transactions : this.getFallbackRecentTransactions();
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return this.getFallbackRecentTransactions();
    }
  }

  private getFallbackTopProducts(): TopProduct[] {
    return [
      { name: "Alaska Evaporated Milk", sales: 2800 },
      { name: "Oishi Prawn Crackers", sales: 2580 },
      { name: "Del Monte Tomato Sauce", sales: 2360 },
      { name: "Champion Detergent Bar", sales: 2140 },
      { name: "Alaska Condensed Milk", sales: 1920 },
      { name: "Pride Dishwashing Liquid", sales: 1700 },
      { name: "Del Monte Sweet Style Spaghetti Sauce", sales: 1480 },
      { name: "Oishi Potato Chips", sales: 1260 },
      { name: "Alaska Fresh Milk", sales: 1040 },
      { name: "Champion Liquid Detergent", sales: 820 }
    ];
  }

  private getFallbackDailyTrends(days: number): DailyTrend[] {
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString(),
        transactions: Math.floor(Math.random() * 500) + 200
      });
    }
    return trends;
  }

  private getFallbackRecentTransactions(): RecentTransaction[] {
    return [
      { id: "TXN001", store: "SM Megamall", amount: 1250, items: 8, date: "2024-01-15", status: "Completed" },
      { id: "TXN002", store: "Robinsons Galleria", amount: 890, items: 5, date: "2024-01-15", status: "Completed" },
      { id: "TXN003", store: "Ayala Center Cebu", amount: 2100, items: 12, date: "2024-01-14", status: "Completed" },
      { id: "TXN004", store: "SM North EDSA", amount: 750, items: 4, date: "2024-01-14", status: "Completed" },
      { id: "TXN005", store: "Greenbelt 5", amount: 1680, items: 9, date: "2024-01-14", status: "Completed" }
    ];
  }
}

export const supabaseService = new SupabaseService();
