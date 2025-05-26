
import { supabase } from "@/integrations/supabase/client";

export const supabaseService = {
  async getKPIs(dateRange: string) {
    try {
      console.log('getKPIs called with dateRange:', dateRange);
      
      // Calculate date range based on our sample data (March-May 2025)
      const daysAgo = parseInt(dateRange);
      let startDate: string;
      
      if (daysAgo <= 30) {
        // Last 30 days - show May 2025 data
        startDate = '2025-05-01';
      } else if (daysAgo <= 60) {
        // Last 60 days - show April-May 2025 data  
        startDate = '2025-04-01';
      } else {
        // Last 90 days - show all March-May 2025 data
        startDate = '2025-03-01';
      }
      
      console.log('Using startDate:', startDate);
      
      // Get total revenue and transaction count
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('total_value, basket_size')
        .gte('transaction_date', startDate);

      console.log('Transaction data result:', { transactionData, transactionError });

      if (transactionError) throw transactionError;

      const totalRevenue = transactionData?.reduce((sum, t) => sum + (parseFloat(t.total_value?.toString() || '0')), 0) || 0;
      const transactionCount = transactionData?.length || 0;
      const avgBasketSize = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      console.log('Calculated KPIs:', { totalRevenue, transactionCount, avgBasketSize });

      // Get top product with proper joins
      const { data: topProductData, error: topProductError } = await supabase
        .from('transaction_items')
        .select(`
          quantity,
          skus!inner(sku_name),
          transactions!inner(transaction_date)
        `)
        .gte('transactions.transaction_date', startDate)
        .order('quantity', { ascending: false })
        .limit(1);

      console.log('Top product data result:', { topProductData, topProductError });

      if (topProductError) throw topProductError;

      const topProduct = topProductData?.[0]?.skus?.sku_name || "No data";

      // Get store count
      const { count: storeCount } = await supabase
        .from('stores')
        .select('*', { count: 'exact' });

      console.log('Store count:', storeCount);

      const result = {
        totalRevenue,
        transactionCount,
        avgBasketSize,
        topProduct,
        marketShare: 23.5, // Static for now
        storeCount: storeCount || 0
      };

      console.log('Final KPI result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  },

  async getTopProducts(dateRange: string) {
    try {
      console.log('getTopProducts called with dateRange:', dateRange);
      
      // Calculate date range
      const daysAgo = parseInt(dateRange);
      let startDate: string;
      
      if (daysAgo <= 30) {
        startDate = '2025-05-01';
      } else if (daysAgo <= 60) {
        startDate = '2025-04-01';
      } else {
        startDate = '2025-03-01';
      }

      console.log('Top products using startDate:', startDate);

      const { data, error } = await supabase
        .from('transaction_items')
        .select(`
          quantity,
          price,
          skus!inner(sku_name),
          transactions!inner(transaction_date)
        `)
        .gte('transactions.transaction_date', startDate);

      console.log('Top products data result:', { data, error });

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

      console.log('Product sales aggregated:', productSales);

      // Convert to array and sort
      const topProducts = Object.entries(productSales)
        .map(([name, sales]) => ({ 
          name: name.length > 25 ? name.substring(0, 25) + '...' : name, 
          sales: sales as number 
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);

      console.log('Final top products result:', topProducts);
      return topProducts;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  },

  async getDailyTrends(dateRange: string) {
    try {
      console.log('getDailyTrends called with dateRange:', dateRange);
      
      // Calculate date range
      const daysAgo = parseInt(dateRange);
      let startDate: string;
      
      if (daysAgo <= 30) {
        startDate = '2025-05-01';
      } else if (daysAgo <= 60) {
        startDate = '2025-04-01';
      } else {
        startDate = '2025-03-01';
      }

      console.log('Daily trends using startDate:', startDate);

      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_date')
        .gte('transaction_date', startDate)
        .order('transaction_date');

      console.log('Daily trends data result:', { data, error });

      if (error) throw error;

      // Group by date
      const dailyCounts = data?.reduce((acc: any, transaction: any) => {
        const date = new Date(transaction.transaction_date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      console.log('Daily counts aggregated:', dailyCounts);

      // Convert to array format for charts
      const trends = Object.entries(dailyCounts).map(([date, transactions]) => ({
        date,
        transactions: transactions as number
      }));

      console.log('Final daily trends result:', trends);
      return trends;
    } catch (error) {
      console.error('Error fetching daily trends:', error);
      throw error;
    }
  },

  async getRecentTransactions() {
    try {
      console.log('getRecentTransactions called');
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          transaction_id,
          total_value,
          basket_size,
          transaction_date,
          stores!inner(store_name)
        `)
        .gte('transaction_date', '2025-03-01')
        .order('transaction_date', { ascending: false })
        .limit(10);

      console.log('Recent transactions data result:', { data, error });

      if (error) throw error;

      const result = data?.map(transaction => ({
        id: transaction.transaction_id,
        store: transaction.stores?.store_name || 'Unknown Store',
        amount: parseFloat(transaction.total_value?.toString() || '0'),
        items: transaction.basket_size || 0,
        date: new Date(transaction.transaction_date).toLocaleDateString(),
        status: 'Completed'
      })) || [];

      console.log('Final recent transactions result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }
};
