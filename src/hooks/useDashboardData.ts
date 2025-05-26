import { useQuery } from '@tanstack/react-query';
import { mockData } from '@/data/mockData';

export const useDashboardData = () => {
  return {
    useKPIs: (dateRange: string) => {
      return useQuery({
        queryKey: ['kpis', dateRange],
        queryFn: () => mockData.getKPIs(dateRange),
        staleTime: 30000, // 30 seconds
        refetchInterval: 30000, // Auto-refresh every 30 seconds
      });
    },

    useDailyTrends: (dateRange: string) => {
      return useQuery({
        queryKey: ['dailyTrends', dateRange],
        queryFn: () => mockData.getDailyTrends(dateRange),
        staleTime: 30000,
        refetchInterval: 30000,
      });
    },

    useTopProducts: (dateRange: string) => {
      return useQuery({
        queryKey: ['topProducts', dateRange],
        queryFn: () => mockData.getTopProducts(dateRange),
        staleTime: 30000,
        refetchInterval: 30000,
      });
    },

    useRecentTransactions: () => {
      return useQuery({
        queryKey: ['recentTransactions'],
        queryFn: () => mockData.getRecentTransactions(),
        staleTime: 10000, // 10 seconds for more frequent updates
        refetchInterval: 10000,
      });
    },

    useHealthCheck: () => {
      return useQuery({
        queryKey: ['health'],
        queryFn: () => mockData.checkHealth(),
        staleTime: 5000,
        refetchInterval: 5000,
      });
    },
  };
};