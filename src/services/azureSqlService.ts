// Azure SQL API service for TBWA retail data
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8080/api'
  : 'https://retail-insight-pilot-project.vercel.app/api';

export interface AzureKPIData {
  totalRevenue: number;
  transactionCount: number;
  avgBasketSize: number;
  topProduct: string;
  marketShare: number;
  storeCount: number;
}

export interface AzureTransactionTrend {
  date: string;
  transactions: number;
  revenue: number;
}

export interface AzureTopProduct {
  name: string;
  sales: number;
}

export interface AzureTransaction {
  id: string;
  store: string;
  amount: number;
  items: number;
  date: string;
  status: string;
}

class AzureSqlService {
  private async fetchFromAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getKPIs(dateRange: string): Promise<AzureKPIData> {
    try {
      return await this.fetchFromAPI<AzureKPIData>(`azure-sql/kpis`);
    } catch (error) {
      console.error('Failed to fetch KPIs from Azure SQL:', error);
      // Fallback to mock data if API is unavailable
      const { mockData } = await import('@/data/mockData');
      const mockKPIs = await mockData.getKPIs(dateRange);
      return {
        totalRevenue: mockKPIs.totalRevenue,
        transactionCount: mockKPIs.transactionCount,
        avgBasketSize: mockKPIs.avgBasketSize,
        topProduct: mockKPIs.topProduct,
        marketShare: mockKPIs.marketShare,
        storeCount: mockKPIs.storeCount
      };
    }
  }

  async getDailyTrends(dateRange: string): Promise<AzureTransactionTrend[]> {
    try {
      return await this.fetchFromAPI<AzureTransactionTrend[]>(`azure-sql/trends?days=${dateRange}`);
    } catch (error) {
      console.error('Failed to fetch trends from Azure SQL:', error);
      const { mockData } = await import('@/data/mockData');
      return await mockData.getDailyTrends(dateRange);
    }
  }

  async getTopProducts(dateRange: string): Promise<AzureTopProduct[]> {
    try {
      return await this.fetchFromAPI<AzureTopProduct[]>(`azure-sql/brands`);
    } catch (error) {
      console.error('Failed to fetch top products from Azure SQL:', error);
      const { mockData } = await import('@/data/mockData');
      const products = await mockData.getTopProducts(dateRange);
      return products.map(p => ({
        name: p.name,
        sales: p.sales
      }));
    }
  }

  async getRecentTransactions(): Promise<AzureTransaction[]> {
    try {
      const response = await this.fetchFromAPI<{data: AzureTransaction[]}>('azure-sql/transactions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transactions from Azure SQL:', error);
      const { mockData } = await import('@/data/mockData');
      const transactions = await mockData.getRecentTransactions();
      return transactions.map(t => ({
        id: t.id,
        store: t.store,
        amount: t.amount,
        items: t.items,
        date: t.date,
        status: t.status
      }));
    }
  }
}

export const azureSqlService = new AzureSqlService();
