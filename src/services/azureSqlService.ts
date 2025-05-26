
// Azure SQL API service for TBWA retail data
const AZURE_FUNCTIONS_BASE_URL = process.env.REACT_APP_AZURE_FUNCTIONS_URL || 'https://your-function-app.azurewebsites.net/api';

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
  private async fetchFromAzure<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${AZURE_FUNCTIONS_BASE_URL}/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add your Azure Function key if required
        'x-functions-key': process.env.REACT_APP_AZURE_FUNCTION_KEY || ''
      }
    });

    if (!response.ok) {
      throw new Error(`Azure SQL API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getKPIs(dateRange: string): Promise<AzureKPIData> {
    try {
      return await this.fetchFromAzure<AzureKPIData>(`kpis/${dateRange}`);
    } catch (error) {
      console.error('Failed to fetch KPIs from Azure SQL:', error);
      // Fallback to mock data if Azure is unavailable
      const { mockData } = await import('@/data/mockData');
      return mockData.getKPIs(dateRange) as AzureKPIData;
    }
  }

  async getDailyTrends(dateRange: string): Promise<AzureTransactionTrend[]> {
    try {
      return await this.fetchFromAzure<AzureTransactionTrend[]>(`trends/${dateRange}`);
    } catch (error) {
      console.error('Failed to fetch trends from Azure SQL:', error);
      const { mockData } = await import('@/data/mockData');
      return mockData.getDailyTrends(dateRange);
    }
  }

  async getTopProducts(dateRange: string): Promise<AzureTopProduct[]> {
    try {
      return await this.fetchFromAzure<AzureTopProduct[]>(`products/top/${dateRange}`);
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
      return await this.fetchFromAzure<AzureTransaction[]>('transactions/recent');
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
