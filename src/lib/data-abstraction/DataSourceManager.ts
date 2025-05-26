
export interface DataSource {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  isActive: boolean;
}

export interface QueryResult {
  data: any[];
  metadata?: {
    totalRecords: number;
    queryTime: number;
    source: string;
  };
}

export interface Connector {
  connect(config: Record<string, any>): Promise<void>;
  query(sql: string, params?: any[]): Promise<QueryResult>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export class DataSourceManager {
  private connectors: Map<string, Connector> = new Map();
  private dataSources: Map<string, DataSource> = new Map();
  private activeDataSource: string | null = null;

  registerConnector(type: string, connector: Connector) {
    this.connectors.set(type, connector);
  }

  async addDataSource(dataSource: DataSource): Promise<void> {
    const connector = this.connectors.get(dataSource.type);
    if (!connector) {
      throw new Error(`Connector for type ${dataSource.type} not found`);
    }

    await connector.connect(dataSource.config);
    this.dataSources.set(dataSource.id, dataSource);
    
    if (dataSource.isActive) {
      this.activeDataSource = dataSource.id;
    }
  }

  async query(queryName: string, params?: any): Promise<QueryResult> {
    if (!this.activeDataSource) {
      throw new Error('No active data source');
    }

    const dataSource = this.dataSources.get(this.activeDataSource);
    if (!dataSource) {
      throw new Error('Active data source not found');
    }

    const connector = this.connectors.get(dataSource.type);
    if (!connector) {
      throw new Error(`Connector for type ${dataSource.type} not found`);
    }

    // Map query names to SQL
    const sqlQueries = this.getQueryMap(queryName, params);
    return await connector.query(sqlQueries, params);
  }

  private getQueryMap(queryName: string, params?: any): string {
    const queries: Record<string, string> = {
      'kpis': `SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as transaction_count,
        AVG(amount) as avg_basket_size,
        COUNT(DISTINCT store_location) as store_count
        FROM transactions_mock 
        WHERE date >= DATEADD(day, -${params?.days || 30}, GETDATE())`,
      
      'transactions': `SELECT TOP 10 * FROM vw_tbwa_latest_mock_transactions ORDER BY date DESC`,
      
      'trends': `SELECT 
        CAST(date as DATE) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as revenue
        FROM transactions_mock 
        WHERE date >= DATEADD(day, -${params?.days || 30}, GETDATE())
        GROUP BY CAST(date as DATE)
        ORDER BY date`,
      
      'top-products': `SELECT 
        brand_name as name,
        SUM(amount) as sales,
        COUNT(*) as transaction_count
        FROM transactions_mock 
        WHERE date >= DATEADD(day, -${params?.days || 30}, GETDATE())
        GROUP BY brand_name
        ORDER BY sales DESC`
    };

    return queries[queryName] || 'SELECT 1';
  }

  setActiveDataSource(dataSourceId: string): void {
    if (this.dataSources.has(dataSourceId)) {
      this.activeDataSource = dataSourceId;
    }
  }

  getActiveDataSource(): DataSource | null {
    if (!this.activeDataSource) return null;
    return this.dataSources.get(this.activeDataSource) || null;
  }
}
