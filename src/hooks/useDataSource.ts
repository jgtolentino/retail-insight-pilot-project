
import { useState, useEffect } from 'react';
import { dataSourceManager } from '@/lib/dataSourceInstance';
import { QueryResult } from '@/lib/data-abstraction/DataSourceManager';

export function useDataSource() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = async (queryName: string, params?: any): Promise<QueryResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await dataSourceManager.query(queryName, params);
      return result;
    } catch (err) {
      console.error('Data source query failed:', err);
      setError(err instanceof Error ? err.message : 'Query failed');
      
      // Fallback to mock data
      try {
        dataSourceManager.setActiveDataSource('mock-fallback');
        const fallbackResult = await dataSourceManager.query(queryName, params);
        console.log('Using fallback mock data');
        return fallbackResult;
      } catch (fallbackErr) {
        console.error('Fallback query also failed:', fallbackErr);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getKPIs = async (dateRange: string) => {
    const result = await query('kpis', { days: parseInt(dateRange) });
    return result?.data[0] || null;
  };

  const getTransactions = async () => {
    const result = await query('transactions');
    return result?.data || [];
  };

  const getTrends = async (dateRange: string) => {
    const result = await query('trends', { days: parseInt(dateRange) });
    return result?.data || [];
  };

  const getTopProducts = async (dateRange: string) => {
    const result = await query('top-products', { days: parseInt(dateRange) });
    return result?.data || [];
  };

  return {
    query,
    getKPIs,
    getTransactions,
    getTrends,
    getTopProducts,
    isLoading,
    error,
    activeSource: dataSourceManager.getActiveDataSource()
  };
}
