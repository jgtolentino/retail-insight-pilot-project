
import { Connector, QueryResult } from '../DataSourceManager';
import { mockData } from '@/data/mockData';

export class MockDataConnector implements Connector {
  private connected: boolean = false;

  async connect(config: Record<string, any>): Promise<void> {
    this.connected = true;
  }

  async query(queryName: string, params?: any): Promise<QueryResult> {
    if (!this.connected) {
      throw new Error('Not connected to mock data');
    }

    let data: any;
    const dateRange = params?.days?.toString() || "30";

    switch (queryName) {
      case 'kpis':
        data = mockData.getKPIs(dateRange);
        break;
      case 'transactions':
        data = mockData.getRecentTransactions();
        break;
      case 'trends':
        data = mockData.getDailyTrends(dateRange);
        break;
      case 'top-products':
        data = mockData.getTopProducts(dateRange);
        break;
      default:
        data = [];
    }

    return {
      data: Array.isArray(data) ? data : [data],
      metadata: {
        totalRecords: Array.isArray(data) ? data.length : 1,
        queryTime: Date.now(),
        source: 'Mock Data'
      }
    };
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
