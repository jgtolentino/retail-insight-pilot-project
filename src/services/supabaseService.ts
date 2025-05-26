
import { supabase } from "@/integrations/supabase/client";

export const supabaseService = {
  async getKPIs(dateRange: string) {
    try {
      console.log('getKPIs called with dateRange:', dateRange);
      
      // Get all transactions with their total values
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('transaction_id, total_value, basket_size, transaction_date, store_id');

      console.log('Transactions query result:', { 
        count: transactions?.length, 
        sample: transactions?.slice(0, 3),
        error: transError 
      });

      if (transError) {
        console.error('Error fetching transactions:', transError);
        throw transError;
      }

      if (!transactions || transactions.length === 0) {
        console.log('No transactions found, returning zero KPIs');
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

      // Calculate KPIs from transactions
      const totalRevenue = transactions.reduce((sum, t) => {
        const value = parseFloat(t.total_value?.toString() || '0');
        return sum + value;
      }, 0);
      
      const transactionCount = transactions.length;
      const avgBasketSize = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      console.log('Calculated basic KPIs:', { totalRevenue, transactionCount, avgBasketSize });

      // Get transaction IDs for finding top products
      const transactionIds = transactions.map(t => t.transaction_id);
      
      let topProduct = "No data";
      if (transactionIds.length > 0) {
        // Get transaction items to find top product
        const { data: items, error: itemsError } = await supabase
          .from('transaction_items')
          .select('sku_id, quantity')
          .in('transaction_id', transactionIds);

        console.log('Transaction items result:', { 
          count: items?.length, 
          error: itemsError 
        });

        if (items && items.length > 0) {
          // Find most sold SKU
          const skuCounts = items.reduce((acc: any, item: any) => {
            acc[item.sku_id] = (acc[item.sku_id] || 0) + (item.quantity || 0);
            return acc;
          }, {});
          
          const topSkuId = Object.keys(skuCounts).reduce((a, b) => 
            skuCounts[a] > skuCounts[b] ? a : b
          );

          // Get SKU name
          const { data: skuData, error: skuError } = await supabase
            .from('skus')
            .select('sku_name')
            .eq('sku_id', topSkuId)
            .single();

          if (skuData && !skuError) {
            topProduct = skuData.sku_name;
          }
        }
      }

      // Get store count
      const { count: storeCount } = await supabase
        .from('stores')
        .select('*', { count: 'exact' });

      const result = {
        totalRevenue,
        transactionCount,
        avgBasketSize,
        topProduct,
        marketShare: 23.5,
        storeCount: storeCount || 0
      };

      console.log('Final KPI result:', result);
      return result;
    } catch (error) {
      console.error('Error in getKPIs:', error);
      throw error;
    }
  },

  async getTopProducts(dateRange: string) {
    try {
      console.log('getTopProducts called');
      
      // Get all transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('transaction_id');

      if (transError || !transactions || transactions.length === 0) {
        console.log('No transactions for top products');
        return [];
      }

      const transactionIds = transactions.map(t => t.transaction_id);

      // Get transaction items with price and quantity
      const { data: items, error: itemsError } = await supabase
        .from('transaction_items')
        .select('sku_id, quantity, price')
        .in('transaction_id', transactionIds);

      if (itemsError || !items || items.length === 0) {
        console.log('No transaction items found');
        return [];
      }

      // Calculate total sales per SKU
      const skuSales = items.reduce((acc: any, item: any) => {
        const skuId = item.sku_id;
        const sales = (item.quantity || 0) * (parseFloat(item.price?.toString() || '0'));
        acc[skuId] = (acc[skuId] || 0) + sales;
        return acc;
      }, {});

      // Get SKU names
      const skuIds = Object.keys(skuSales);
      const { data: skuData, error: skuError } = await supabase
        .from('skus')
        .select('sku_id, sku_name')
        .in('sku_id', skuIds);

      if (skuError || !skuData) {
        console.log('No SKU data found');
        return [];
      }

      // Create top products array
      const topProducts = skuIds
        .map(skuId => {
          const sku = skuData.find(s => s.sku_id === skuId);
          const name = sku?.sku_name || `SKU ${skuId}`;
          return {
            name: name.length > 25 ? name.substring(0, 25) + '...' : name,
            sales: skuSales[skuId]
          };
        })
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);

      console.log('Top products result:', topProducts);
      return topProducts;
    } catch (error) {
      console.error('Error in getTopProducts:', error);
      throw error;
    }
  },

  async getDailyTrends(dateRange: string) {
    try {
      console.log('getDailyTrends called');

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('transaction_date')
        .order('transaction_date');

      if (error || !transactions || transactions.length === 0) {
        console.log('No transactions for daily trends');
        return [];
      }

      // Group by date
      const dailyCounts = transactions.reduce((acc: any, transaction: any) => {
        const date = new Date(transaction.transaction_date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Convert to chart format
      const trends = Object.entries(dailyCounts)
        .map(([date, transactions]) => ({
          date,
          transactions: transactions as number
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      console.log('Daily trends result:', trends);
      return trends;
    } catch (error) {
      console.error('Error in getDailyTrends:', error);
      throw error;
    }
  },

  async getRecentTransactions() {
    try {
      console.log('getRecentTransactions called');
      
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('transaction_id, total_value, basket_size, transaction_date, store_id')
        .order('transaction_date', { ascending: false })
        .limit(10);

      if (transError || !transactions || transactions.length === 0) {
        console.log('No recent transactions found');
        return [];
      }

      // Get store names
      const storeIds = [...new Set(transactions.map(t => t.store_id))];
      const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('store_id, store_name')
        .in('store_id', storeIds);

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

      console.log('Recent transactions result:', result);
      return result;
    } catch (error) {
      console.error('Error in getRecentTransactions:', error);
      throw error;
    }
  }
};
