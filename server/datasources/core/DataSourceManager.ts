import { 
  IDataConnector, 
  ConnectionConfig,
  ConnectorError,
  ConnectionError,
  ConnectorMetadata
} from './types';
import { BaseConnector } from './BaseConnector';
import { MemoryConnector } from '../connectors/MemoryConnector';
import { CSVConnector } from '../connectors/CSVConnector';
import { RestAPIConnector } from '../connectors/RestAPIConnector';
// Lazy load optional connectors to avoid dependency errors
// import { ParquetConnector } from '../connectors/ParquetConnector';
// import { PostgreSQLConnector } from '../connectors/PostgreSQLConnector';
// import { MongoDBConnector } from '../connectors/MongoDBConnector';

// Type for connector constructor
type ConnectorConstructor = new (config: ConnectionConfig) => IDataConnector;

// Registry entry for connectors
interface ConnectorRegistryEntry {
  constructor: ConnectorConstructor;
  metadata: ConnectorMetadata;
}

/**
 * Central manager for all data source connections
 */
export class DataSourceManager {
  private static instance: DataSourceManager;
  private connectors = new Map<string, IDataConnector>();
  private registry = new Map<string, ConnectorRegistryEntry>();
  private defaultConnectorId = 'default-memory';

  private constructor() {
    // Register built-in connectors
    this.registerBuiltInConnectors();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager();
    }
    return DataSourceManager.instance;
  }

  /**
   * Initialize the manager with default data source
   */
  async initialize(): Promise<void> {
    // Create default memory connector with existing data
    const memoryConnector = new MemoryConnector({
      id: this.defaultConnectorId,
      name: 'Default Memory Storage',
      type: 'memory',
      description: 'In-memory storage with Philippine brand data'
    });

    await this.addConnector(this.defaultConnectorId, memoryConnector);
  }

  /**
   * Register a new connector type
   */
  registerConnectorType(
    type: string,
    constructor: ConnectorConstructor,
    metadata: ConnectorMetadata
  ): void {
    this.registry.set(type.toLowerCase(), { constructor, metadata });
  }

  /**
   * Get available connector types
   */
  getAvailableConnectorTypes(): ConnectorMetadata[] {
    return Array.from(this.registry.values()).map(entry => entry.metadata);
  }

  /**
   * Create a new connector instance
   */
  createConnector(config: ConnectionConfig): IDataConnector {
    const entry = this.registry.get(config.type.toLowerCase());
    
    if (!entry) {
      throw new ConnectorError(
        `Unknown connector type: ${config.type}`,
        'UNKNOWN_CONNECTOR_TYPE',
        { availableTypes: Array.from(this.registry.keys()) }
      );
    }

    return new entry.constructor(config);
  }

  /**
   * Add a new data source connection
   */
  async addDataSource(config: ConnectionConfig): Promise<void> {
    // Check if already exists
    if (this.connectors.has(config.id)) {
      throw new ConnectorError(
        `Data source with id '${config.id}' already exists`,
        'DUPLICATE_DATASOURCE'
      );
    }

    // Create connector instance
    const connector = this.createConnector(config);
    
    // Connect to the data source
    try {
      await connector.connect(config);
      await this.addConnector(config.id, connector);
    } catch (error) {
      throw new ConnectionError(
        `Failed to connect to data source: ${error.message}`,
        { config, originalError: error }
      );
    }
  }

  /**
   * Add an already connected connector
   */
  private async addConnector(id: string, connector: IDataConnector): Promise<void> {
    // Test connection before adding
    const testResult = await connector.testConnection();
    if (!testResult.success) {
      throw new ConnectionError(
        testResult.message,
        testResult.details
      );
    }

    this.connectors.set(id, connector);
  }

  /**
   * Remove a data source
   */
  async removeDataSource(id: string): Promise<void> {
    const connector = this.connectors.get(id);
    
    if (!connector) {
      throw new ConnectorError(
        `Data source '${id}' not found`,
        'DATASOURCE_NOT_FOUND'
      );
    }

    // Don't allow removing the default connector
    if (id === this.defaultConnectorId) {
      throw new ConnectorError(
        'Cannot remove the default data source',
        'CANNOT_REMOVE_DEFAULT'
      );
    }

    // Disconnect and remove
    await connector.disconnect();
    this.connectors.delete(id);
  }

  /**
   * Get a connector by ID
   */
  async getConnector(id?: string): Promise<IDataConnector> {
    const connectorId = id || this.defaultConnectorId;
    const connector = this.connectors.get(connectorId);
    
    if (!connector) {
      throw new ConnectorError(
        `Data source '${connectorId}' not found`,
        'DATASOURCE_NOT_FOUND',
        { availableDataSources: Array.from(this.connectors.keys()) }
      );
    }

    // Ensure it's still connected
    if (!connector.isConnected()) {
      throw new ConnectionError(
        `Data source '${connectorId}' is not connected`
      );
    }

    return connector;
  }

  /**
   * Get all active data sources
   */
  getDataSources(): Array<{
    id: string;
    name: string;
    type: string;
    connected: boolean;
    capabilities: any;
  }> {
    const sources: any[] = [];
    
    this.connectors.forEach((connector, id) => {
      const metadata = connector.getMetadata();
      const capabilities = connector.getCapabilities();
      
      sources.push({
        id,
        name: metadata.name,
        type: metadata.name.toLowerCase(),
        connected: connector.isConnected(),
        capabilities
      });
    });

    return sources;
  }

  /**
   * Test a data source connection
   */
  async testDataSource(id: string): Promise<any> {
    const connector = await this.getConnector(id);
    return connector.testConnection();
  }

  /**
   * Execute a query on a specific data source
   */
  async query(dataSourceId: string | undefined, request: any): Promise<any> {
    const connector = await this.getConnector(dataSourceId);
    return connector.query(request);
  }

  /**
   * Get schema for a data source
   */
  async getSchema(dataSourceId: string | undefined): Promise<any> {
    const connector = await this.getConnector(dataSourceId);
    return connector.getSchema();
  }

  /**
   * Get tables for a data source
   */
  async getTables(dataSourceId: string | undefined): Promise<any> {
    const connector = await this.getConnector(dataSourceId);
    return connector.getTables();
  }

  /**
   * Get table schema for a specific table
   */
  async getTableSchema(
    dataSourceId: string | undefined,
    tableName: string
  ): Promise<any> {
    const connector = await this.getConnector(dataSourceId);
    return connector.getTableSchema(tableName);
  }

  /**
   * Set the default data source
   */
  setDefaultDataSource(id: string): void {
    if (!this.connectors.has(id)) {
      throw new ConnectorError(
        `Data source '${id}' not found`,
        'DATASOURCE_NOT_FOUND'
      );
    }
    this.defaultConnectorId = id;
  }

  /**
   * Get the default data source ID
   */
  getDefaultDataSourceId(): string {
    return this.defaultConnectorId;
  }

  /**
   * Cleanup all connections
   */
  async shutdown(): Promise<void> {
    const disconnectPromises: Promise<void>[] = [];

    this.connectors.forEach((connector) => {
      if (connector.isConnected()) {
        disconnectPromises.push(connector.disconnect());
      }
    });

    await Promise.all(disconnectPromises);
    this.connectors.clear();
  }

  /**
   * Register built-in connector types
   */
  private registerBuiltInConnectors(): void {
    // Memory connector (for existing data)
    this.registerConnectorType('memory', MemoryConnector, {
      name: 'memory',
      displayName: 'In-Memory Storage',
      description: 'Store data in application memory',
      version: '1.0.0',
      author: 'System',
      icon: 'database',
      configSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' }
        },
        required: ['id', 'name']
      }
    });

    // CSV connector
    this.registerConnectorType('csv', CSVConnector, {
      name: 'csv',
      displayName: 'CSV File Connector',
      description: 'Load and query CSV files with SQL',
      version: '1.0.0',
      author: 'System',
      icon: 'file-text',
      configSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          filePath: { type: 'string', description: 'Optional initial CSV file path' }
        },
        required: ['id', 'name']
      }
    });

    // REST API connector
    this.registerConnectorType('rest-api', RestAPIConnector, {
      name: 'rest-api',
      displayName: 'REST API Connector',
      description: 'Connect to any REST API and query data with SQL',
      version: '1.0.0',
      author: 'System',
      icon: 'cloud',
      configSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          baseUrl: { type: 'string', description: 'Base URL of the REST API' },
          auth: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['basic', 'bearer', 'apiKey', 'oauth2'] },
              credentials: { type: 'object' }
            }
          },
          headers: { type: 'object', description: 'Additional headers to send with requests' },
          rateLimit: {
            type: 'object',
            properties: {
              requests: { type: 'number' },
              interval: { type: 'number' }
            }
          }
        },
        required: ['id', 'name', 'baseUrl']
      }
    });

    // Parquet connector - REQUIRES: npm install duckdb
    // Uncomment after installing dependencies
    /*
    this.registerConnectorType('parquet', ParquetConnector, {
      name: 'parquet',
      displayName: 'Parquet File Connector',
      description: 'Query Parquet files with DuckDB engine - supports local and cloud storage',
      version: '1.0.0',
      author: 'System',
      icon: 'file-archive',
      configSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          filePath: { type: 'string', description: 'Path to Parquet file or glob pattern' },
          storageType: { 
            type: 'string', 
            enum: ['local', 'azure', 's3'],
            description: 'Storage type for Parquet files'
          },
          azureConnectionString: { type: 'string', description: 'Azure Storage connection string' },
          azureContainerName: { type: 'string', description: 'Azure container name' },
          s3Bucket: { type: 'string', description: 'S3 bucket name' },
          s3Region: { type: 'string', description: 'S3 region' },
          s3AccessKeyId: { type: 'string', description: 'S3 access key ID' },
          s3SecretAccessKey: { type: 'string', description: 'S3 secret access key' }
        },
        required: ['id', 'name']
      }
    });
    */

    // PostgreSQL/Azure SQL connector - REQUIRES: npm install mssql (already installed)
    this.registerConnectorType('azure-sql', PostgreSQLConnector, {
      name: 'azure-sql',
      displayName: 'Azure SQL Database',
      description: 'Connect to Azure SQL databases with full T-SQL support',
      version: '1.0.0',
      author: 'System',
      icon: 'database',
      configSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          host: { type: 'string', description: 'Database host' },
          port: { type: 'number', description: 'Database port (default: 5432)' },
          database: { type: 'string', description: 'Database name' },
          user: { type: 'string', description: 'Username' },
          password: { type: 'string', description: 'Password' },
          ssl: { 
            type: ['boolean', 'object'],
            description: 'SSL configuration'
          },
          connectionTimeoutMillis: { type: 'number', description: 'Connection timeout in milliseconds' },
          max: { type: 'number', description: 'Maximum pool size' }
        },
        required: ['id', 'name', 'host', 'database', 'user', 'password']
      }
    });

    // MongoDB connector - REQUIRES: npm install mongodb
    // Uncomment after installing dependencies
    /*
    this.registerConnectorType('mongodb', MongoDBConnector, {
      name: 'mongodb',
      displayName: 'MongoDB Database',
      description: 'Connect to MongoDB with aggregation pipeline support',
      version: '1.0.0',
      author: 'System',
      icon: 'database',
      configSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          connectionString: { type: 'string', description: 'MongoDB connection string' },
          host: { type: 'string', description: 'MongoDB host' },
          port: { type: 'number', description: 'MongoDB port (default: 27017)' },
          database: { type: 'string', description: 'Database name' },
          username: { type: 'string', description: 'Username' },
          password: { type: 'string', description: 'Password' },
          authSource: { type: 'string', description: 'Authentication database' },
          replicaSet: { type: 'string', description: 'Replica set name' },
          ssl: { type: 'boolean', description: 'Use SSL/TLS' }
        },
        required: ['id', 'name', 'database']
      }
    });
    */
  }
}

// Export singleton instance
export const dataSourceManager = DataSourceManager.getInstance();