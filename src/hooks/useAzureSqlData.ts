import { useQuery } from '@tanstack/react-query';
import { azureSqlService } from '@/services/azureSqlService';

export const useAzureSqlData = () => {
  return {
    useKPIs: (dateRange: string) => {
      return useQuery({
        queryKey: ['azure-sql', 'kpis', dateRange],
        queryFn: () => azureSqlService.getKPIs(dateRange),
        staleTime: 60000, // 1 minute
        refetchInterval: 60000, // Auto-refresh every minute
      });
    },

    useDailyTrends: (dateRange: string) => {
      return useQuery({
        queryKey: ['azure-sql', 'trends', dateRange],
        queryFn: () => azureSqlService.getDailyTrends(dateRange),
        staleTime: 60000,
        refetchInterval: 60000,
      });
    },

    useTopProducts: (dateRange: string) => {
      return useQuery({
        queryKey: ['azure-sql', 'products', dateRange],
        queryFn: () => azureSqlService.getTopProducts(dateRange),
        staleTime: 60000,
        refetchInterval: 60000,
      });
    },

    useRecentTransactions: () => {
      return useQuery({
        queryKey: ['azure-sql', 'transactions'],
        queryFn: () => azureSqlService.getRecentTransactions(),
        staleTime: 30000, // 30 seconds for more frequent updates
        refetchInterval: 30000,
      });
    },

    useHealthCheck: () => {
      return useQuery({
        queryKey: ['azure-sql', 'health'],
        queryFn: async () => {
          try {
            await azureSqlService.getKPIs('7');
            return { status: 'connected', message: 'Azure SQL connection successful' };
          } catch (error) {
            return { status: 'fallback', message: 'Using mock data fallback' };
          }
        },
        staleTime: 30000,
        refetchInterval: 30000,
      });
    },
  };
};
