
import { Connector, QueryResult } from '../DataSourceManager';

export class AzureSQLConnector implements Connector {
  private apiBaseUrl: string;
  private connected: boolean = false;

  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async connect(config: Record<string, any>): Promise<void> {
    try {
      // Test connection by making a simple API call
      const response = await fetch(`${this.apiBaseUrl}/azure-sql/metadata`);
      if (response.ok) {
        this.connected = true;
      } else {
        throw new Error('Failed to connect to Azure SQL API');
      }
    } catch (error) {
      this.connected = false;
      throw error;
    }
  }

  async query(queryName: string, params?: any): Promise<QueryResult> {
    if (!this.connected) {
      throw new Error('Not connected to Azure SQL');
    }

    // Map query names to API endpoints
    let endpoint: string;
    switch (queryName) {
      case 'kpis':
        endpoint = 'kpis';
        break;
      case 'transactions':
        endpoint = 'transactions';
        break;
      case 'trends':
        endpoint = 'trends';
        break;
      case 'top-products':
        endpoint = 'top-products';
        break;
      default:
        throw new Error(`Unknown query: ${queryName}`);
    }

    let url = `${this.apiBaseUrl}/azure-sql/${endpoint}`;
    if (params?.days) {
      url += `?days=${params.days}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data: Array.isArray(data) ? data : [data],
      metadata: {
        totalRecords: Array.isArray(data) ? data.length : 1,
        queryTime: Date.now(),
        source: 'Azure SQL Database'
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
