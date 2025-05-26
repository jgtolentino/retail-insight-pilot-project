
import { useQuery } from "@tanstack/react-query";
import { supabaseService } from "@/services/supabaseService";

export const useSupabaseData = () => {
  const useKPIs = (dateRange: string) => {
    return useQuery({
      queryKey: ['supabase-kpis', dateRange],
      queryFn: () => supabaseService.getKPIs(dateRange),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });
  };

  const useTopProducts = (dateRange: string) => {
    return useQuery({
      queryKey: ['supabase-top-products', dateRange],
      queryFn: () => supabaseService.getTopProducts(dateRange),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    });
  };

  const useDailyTrends = (dateRange: string) => {
    return useQuery({
      queryKey: ['supabase-daily-trends', dateRange],
      queryFn: () => supabaseService.getDailyTrends(dateRange),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    });
  };

  const useRecentTransactions = () => {
    return useQuery({
      queryKey: ['supabase-recent-transactions'],
      queryFn: () => supabaseService.getRecentTransactions(),
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 2 * 60 * 1000,
    });
  };

  return {
    useKPIs,
    useTopProducts,
    useDailyTrends,
    useRecentTransactions,
  };
};
