
import { supabase } from "@/integrations/supabase/client";

export const supabaseService = {
  async getKPIs(dateRange: string) {
    try {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

      // Get total revenue and transaction count
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('total_value, basket_size')
        .gte('transaction_date', cutoffDate.toISOString());

      if (transactionError) throw transactionError;

      const totalRevenue = transactionData?.reduce((sum, t) => sum + (parseFloat(t.total_value?.toString() || '0')), 0) || 0;
      const transactionCount = transactionData?.length || 0;
      const avgBasketSize = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      // Get top product with proper joins
      const { data: topProductData, error: topProductError } = await supabase
        .from('transaction_items')
        .select(`
          quantity,
          skus!inner(sku_name)
        `)
        .order('quantity', { ascending: false })
        .limit(1);

      if (topProductError) throw topProductError;

      const topProduct = topProductData?.[0]?.skus?.sku_name || "No data";

      // Get store count
      const { count: storeCount } = await supabase
        .from('stores')
        .select('*', { count: 'exact' });

      return {
        totalRevenue,
        transactionCount,
        avgBasketSize,
        topProduct,
        marketShare: 23.5, // Static for now
        storeCount: storeCount || 0
      };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  },

  async getTopProducts(dateRange: string) {
    try {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('transaction_items')
        .select(`
          quantity,
          price,
          skus!inner(sku_name),
          transactions!inner(transaction_date)
        `)
        .gte('transactions.transaction_date', cutoffDate.toISOString());

      if (error) throw error;

      // Group by SKU and calculate total sales
      const productSales = data?.reduce((acc: any, item: any) => {
        const skuName = item.skus?.sku_name;
        if (skuName) {
          if (!acc[skuName]) {
            acc[skuName] = 0;
          }
          acc[skuName] += (item.quantity || 0) * (parseFloat(item.price?.toString() || '0'));
        }
        return acc;
      }, {}) || {};

      // Convert to array and sort
      const topProducts = Object.entries(productSales)
        .map(([name, sales]) => ({ 
          name: name.length > 25 ? name.substring(0, 25) + '...' : name, 
          sales: sales as number 
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);

      return topProducts;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  },

  async getDailyTrends(dateRange: string) {
    try {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_date')
        .gte('transaction_date', cutoffDate.toISOString())
        .order('transaction_date');

      if (error) throw error;

      // Group by date
      const dailyCounts = data?.reduce((acc: any, transaction: any) => {
        const date = new Date(transaction.transaction_date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      // Convert to array format for charts and ensure we have data for the range
      const trends = Object.entries(dailyCounts).map(([date, transactions]) => ({
        date,
        transactions: transactions as number
      }));

      // Fill in missing dates with 0 transactions if needed
      if (trends.length === 0) {
        // Generate sample dates for the range if no data
        const sampleTrends = [];
        for (let i = 0; i < Math.min(daysAgo, 14); i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          sampleTrends.push({
            date: date.toISOString().split('T')[0],
            transactions: 0
          });
        }
        return sampleTrends.reverse();
      }

      return trends;
    } catch (error) {
      console.error('Error fetching daily trends:', error);
      throw error;
    }
  },

  async getRecentTransactions() {
    try {
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

      if (error) throw error;

      return data?.map(transaction => ({
        id: transaction.transaction_id,
        store: transaction.stores?.store_name || 'Unknown Store',
        amount: parseFloat(transaction.total_value?.toString() || '0'),
        items: transaction.basket_size || 0,
        date: new Date(transaction.transaction_date).toLocaleDateString(),
        status: 'Completed'
      })) || [];
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }
};
