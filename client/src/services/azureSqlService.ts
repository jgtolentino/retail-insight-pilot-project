
// Azure SQL API service for TBWA retail data
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface AzureKPIData {
  total_revenue: number;
  transaction_count: number;
  avg_basket_size: number;
  top_product: string;
  market_share: number;
  store_count: number;
}

export interface AzureTransactionTrend {
  date: string;
  transactions: number;
  revenue: number;
}

export interface AzureTopProduct {
  product_name: string;
  sales_amount: number;
}

export interface AzureTransaction {
  transaction_id: string;
  store_location: string;
  amount: number;
  items: number;
  date: string;
  status: string;
}

class AzureSqlService {
  private async fetchFromAzureSQL<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/azure-sql/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Azure SQL API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getKPIs(dateRange: string): Promise<AzureKPIData> {
    try {
      return await this.fetchFromAzureSQL<AzureKPIData>(`kpis?days=${dateRange}`);
    } catch (error) {
      console.error('Failed to fetch KPIs from Azure SQL:', error);
      // Fallback to mock data if Azure is unavailable
      const { mockData } = await import('@/data/mockData');
      const mockKPIs = mockData.getKPIs(dateRange);
      return {
        total_revenue: mockKPIs.totalRevenue,
        transaction_count: mockKPIs.transactionCount,
        avg_basket_size: mockKPIs.avgBasketSize,
        top_product: mockKPIs.topProduct,
        market_share: mockKPIs.marketShare,
        store_count: mockKPIs.storeCount
      };
    }
  }

  async getDailyTrends(dateRange: string): Promise<AzureTransactionTrend[]> {
    try {
      return await this.fetchFromAzureSQL<AzureTransactionTrend[]>(`trends?days=${dateRange}`);
    } catch (error) {
      console.error('Failed to fetch trends from Azure SQL:', error);
      const { mockData } = await import('@/data/mockData');
      return mockData.getDailyTrends(dateRange);
    }
  }

  async getTopProducts(dateRange: string): Promise<AzureTopProduct[]> {
    try {
      return await this.fetchFromAzureSQL<AzureTopProduct[]>(`top-products?days=${dateRange}`);
    } catch (error) {
      console.error('Failed to fetch top products from Azure SQL:', error);
      const { mockData } = await import('@/data/mockData');
      return mockData.getTopProducts(dateRange).map(p => ({
        product_name: p.name,
        sales_amount: p.sales
      }));
    }
  }

  async getRecentTransactions(): Promise<AzureTransaction[]> {
    try {
      return await this.fetchFromAzureSQL<AzureTransaction[]>('transactions');
    } catch (error) {
      console.error('Failed to fetch transactions from Azure SQL:', error);
      const { mockData } = await import('@/data/mockData');
      return mockData.getRecentTransactions().map(t => ({
        transaction_id: t.id,
        store_location: t.store,
        amount: t.amount,
        items: t.items,
        date: t.date,
        status: t.status
      }));
    }
  }
}

export const azureSqlService = new AzureSqlService();
