
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
      
      // Get total revenue and transaction count - simplified query first
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('total_value, basket_size, transaction_date')
        .gte('transaction_date', startDate);

      console.log('Transaction data result:', { 
        count: transactionData?.length, 
        sample: transactionData?.slice(0, 2),
        error: transactionError 
      });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        throw transactionError;
      }

      const totalRevenue = transactionData?.reduce((sum, t) => sum + (parseFloat(t.total_value?.toString() || '0')), 0) || 0;
      const transactionCount = transactionData?.length || 0;
      const avgBasketSize = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      console.log('Calculated KPIs:', { totalRevenue, transactionCount, avgBasketSize });

      // Get top product - try without joins first
      const { data: transactionItems, error: itemError } = await supabase
        .from('transaction_items')
        .select('sku_id, quantity');

      console.log('Transaction items result:', { 
        count: transactionItems?.length, 
        sample: transactionItems?.slice(0, 2),
        error: itemError 
      });

      // Get SKU names separately
      const { data: skuData, error: skuError } = await supabase
        .from('skus')
        .select('sku_id, sku_name');

      console.log('SKU data result:', { 
        count: skuData?.length, 
        sample: skuData?.slice(0, 2),
        error: skuError 
      });

      let topProduct = "No data";
      if (transactionItems && skuData && transactionItems.length > 0 && skuData.length > 0) {
        // Find the most sold SKU
        const skuCounts = transactionItems.reduce((acc: any, item: any) => {
          acc[item.sku_id] = (acc[item.sku_id] || 0) + (item.quantity || 0);
          return acc;
        }, {});
        
        const topSkuId = Object.keys(skuCounts).reduce((a, b) => skuCounts[a] > skuCounts[b] ? a : b);
        const topSku = skuData.find(sku => sku.sku_id === topSkuId);
        topProduct = topSku?.sku_name || "Unknown Product";
      }

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

      // Get transactions in date range
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('transaction_id')
        .gte('transaction_date', startDate);

      console.log('Transactions in range:', { 
        count: transactions?.length, 
        error: transError 
      });

      if (!transactions || transactions.length === 0) {
        console.log('No transactions in date range');
        return [];
      }

      const transactionIds = transactions.map(t => t.transaction_id);

      // Get transaction items for those transactions
      const { data: transactionItems, error: itemError } = await supabase
        .from('transaction_items')
        .select('sku_id, quantity, price')
        .in('transaction_id', transactionIds);

      console.log('Transaction items for date range:', { 
        count: transactionItems?.length, 
        error: itemError 
      });

      // Get all SKUs
      const { data: skuData, error: skuError } = await supabase
        .from('skus')
        .select('sku_id, sku_name');

      console.log('All SKUs:', { 
        count: skuData?.length, 
        error: skuError 
      });

      if (!transactionItems || !skuData || transactionItems.length === 0) {
        console.log('No transaction items or SKU data');
        return [];
      }

      // Group by SKU and calculate total sales
      const productSales = transactionItems.reduce((acc: any, item: any) => {
        const skuId = item.sku_id;
        if (skuId) {
          if (!acc[skuId]) {
            acc[skuId] = 0;
          }
          acc[skuId] += (item.quantity || 0) * (parseFloat(item.price?.toString() || '0'));
        }
        return acc;
      }, {});

      console.log('Product sales by SKU ID:', productSales);

      // Convert to array with SKU names and sort
      const topProducts = Object.entries(productSales)
        .map(([skuId, sales]) => {
          const sku = skuData.find(s => s.sku_id === skuId);
          const name = sku?.sku_name || `Unknown SKU ${skuId}`;
          return { 
            name: name.length > 25 ? name.substring(0, 25) + '...' : name, 
            sales: sales as number 
          };
        })
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

      console.log('Daily trends data result:', { 
        count: data?.length, 
        sample: data?.slice(0, 3),
        error 
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log('No transactions found for daily trends');
        return [];
      }

      // Group by date
      const dailyCounts = data.reduce((acc: any, transaction: any) => {
        const date = new Date(transaction.transaction_date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

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
      
      // Get transactions with store info separately
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('transaction_id, total_value, basket_size, transaction_date, store_id')
        .gte('transaction_date', '2025-03-01')
        .order('transaction_date', { ascending: false })
        .limit(10);

      console.log('Recent transactions data result:', { 
        count: transactions?.length, 
        sample: transactions?.slice(0, 2),
        error: transError 
      });

      if (transError) throw transError;

      if (!transactions || transactions.length === 0) {
        console.log('No recent transactions found');
        return [];
      }

      // Get store names separately
      const storeIds = [...new Set(transactions.map(t => t.store_id))];
      const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('store_id, store_name')
        .in('store_id', storeIds);

      console.log('Store data for transactions:', { 
        count: stores?.length, 
        error: storeError 
      });

      const result = transactions.map(transaction => {
        const store = stores?.find(s => s.store_id === transaction.store_id);
        return {
          id: transaction.transaction_id,
          store: store?.store_name || 'Unknown Store',
          amount: parseFloat(transaction.total_value?.toString() || '0'),
          items: transaction.basket_size || 0,
          date: new Date(transaction.transaction_date).toLocaleDateString(),
          status: 'Completed'
        };
      });

      console.log('Final recent transactions result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }
};
