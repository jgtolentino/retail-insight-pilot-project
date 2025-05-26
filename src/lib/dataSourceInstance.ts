
import { DataSourceManager } from './data-abstraction/DataSourceManager';
import { AzureSQLConnector } from './data-abstraction/connectors/AzureSQLConnector';
import { MockDataConnector } from './data-abstraction/connectors/MockDataConnector';

// Create singleton instance
export const dataSourceManager = new DataSourceManager();

// Register connectors
dataSourceManager.registerConnector('azure-sql', new AzureSQLConnector());
dataSourceManager.registerConnector('mock', new MockDataConnector());

// Initialize data sources
const initializeDataSources = async () => {
  // Add Azure SQL data source
  await dataSourceManager.addDataSource({
    id: 'azure-sql-primary',
    name: 'Azure SQL Database',
    type: 'azure-sql',
    config: {},
    isActive: true
  });

  // Add mock data as fallback
  await dataSourceManager.addDataSource({
    id: 'mock-fallback',
    name: 'Mock Data',
    type: 'mock',
    config: {},
    isActive: false
  });
};

// Initialize on module load
initializeDataSources().catch(console.error);
