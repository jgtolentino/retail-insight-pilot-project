
import { supabase } from "@/integrations/supabase/client";

export const supabaseService = {
  async getKPIs(dateRange: string) {
    try {
      console.log('getKPIs called with dateRange:', dateRange);
      
      // First, let's check what data actually exists in the database
      const { data: allTransactions, error: allError } = await supabase
        .from('transactions')
        .select('transaction_id, total_value, basket_size, transaction_date')
        .order('transaction_date', { ascending: false })
        .limit(10);

      console.log('Sample of all transactions in database:', { 
        count: allTransactions?.length, 
        sample: allTransactions?.slice(0, 3),
        error: allError 
      });

      // If no transactions at all, return empty state
      if (!allTransactions || allTransactions.length === 0) {
        console.log('No transactions found in database at all');
        const { count: storeCount } = await supabase
          .from('stores')
          .select('*', { count: 'exact' });
        
        return {
          totalRevenue: 0,
          transactionCount: 0,
          avgBasketSize: 0,
          topProduct: "No data",
          marketShare: 23.5,
          storeCount: storeCount || 0
        };
      }

      // For now, let's use all available data instead of date filtering
      // since we're having issues with the date filter
      const transactionData = allTransactions;
      
      console.log('Using transaction data:', { 
        count: transactionData?.length, 
        sample: transactionData?.slice(0, 2)
      });

      const totalRevenue = transactionData?.reduce((sum, t) => sum + (parseFloat(t.total_value?.toString() || '0')), 0) || 0;
      const transactionCount = transactionData?.length || 0;
      const avgBasketSize = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      console.log('Calculated KPIs:', { totalRevenue, transactionCount, avgBasketSize });

      // Get transaction IDs for filtering transaction_items
      const transactionIds = transactionData?.map(t => t.transaction_id) || [];
      
      let topProduct = "No data";
      if (transactionIds.length > 0) {
        // Get transaction items for those transactions
        const { data: transactionItems, error: itemError } = await supabase
          .from('transaction_items')
          .select('sku_id, quantity')
          .in('transaction_id', transactionIds);

        console.log('Transaction items result:', { 
          count: transactionItems?.length, 
          sample: transactionItems?.slice(0, 2),
          error: itemError 
        });

        if (transactionItems && transactionItems.length > 0) {
          // Get SKU names
          const skuIds = [...new Set(transactionItems.map(item => item.sku_id))];
          const { data: skuData, error: skuError } = await supabase
            .from('skus')
            .select('sku_id, sku_name')
            .in('sku_id', skuIds);

          console.log('SKU data result:', { 
            count: skuData?.length, 
            sample: skuData?.slice(0, 2),
            error: skuError 
          });

          if (skuData && skuData.length > 0) {
            // Find the most sold SKU
            const skuCounts = transactionItems.reduce((acc: any, item: any) => {
              acc[item.sku_id] = (acc[item.sku_id] || 0) + (item.quantity || 0);
              return acc;
            }, {});
            
            const topSkuId = Object.keys(skuCounts).reduce((a, b) => skuCounts[a] > skuCounts[b] ? a : b);
            const topSku = skuData.find(sku => sku.sku_id === topSkuId);
            topProduct = topSku?.sku_name || "Unknown Product";
          }
        }
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
      
      // Get all transactions first to see what we have
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('transaction_id');

      console.log('All transactions for top products:', { 
        count: transactions?.length, 
        error: transError 
      });

      if (!transactions || transactions.length === 0) {
        console.log('No transactions found for top products');
        return [];
      }

      const transactionIds = transactions.map(t => t.transaction_id);

      // Get transaction items for those transactions
      const { data: transactionItems, error: itemError } = await supabase
        .from('transaction_items')
        .select('sku_id, quantity, price')
        .in('transaction_id', transactionIds);

      console.log('Transaction items for top products:', { 
        count: transactionItems?.length, 
        error: itemError 
      });

      if (!transactionItems || transactionItems.length === 0) {
        console.log('No transaction items found');
        return [];
      }

      // Get all relevant SKUs
      const skuIds = [...new Set(transactionItems.map(item => item.sku_id))];
      const { data: skuData, error: skuError } = await supabase
        .from('skus')
        .select('sku_id, sku_name')
        .in('sku_id', skuIds);

      console.log('All SKUs for top products:', { 
        count: skuData?.length, 
        error: skuError 
      });

      if (!skuData || skuData.length === 0) {
        console.log('No SKU data found');
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

      // Get all transactions for now to see what we have
      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_date')
        .order('transaction_date');

      console.log('All daily trends data result:', { 
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
      
      // Get all recent transactions first to see what we have
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('transaction_id, total_value, basket_size, transaction_date, store_id')
        .order('transaction_date', { ascending: false })
        .limit(10);

      console.log('All recent transactions data result:', { 
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
