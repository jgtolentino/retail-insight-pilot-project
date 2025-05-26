
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
  query(queryName: string, params?: any): Promise<QueryResult>;
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

    // Pass query name directly to connector
    return await connector.query(queryName, params);
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
