
// Azure SQL API endpoints for server-side database access
// This file provides TypeScript interfaces and API calls to the server endpoints

export interface AzureKPIData {
  total_revenue: number;
  transaction_count: number;
  avg_basket_size: number;
  store_count: number;
  top_product?: string;
}

export interface AzureTransaction {
  id: string;
  store: string;
  amount: number;
  items: number;
  date: string;
  status: string;
}

export interface AzureTrend {
  date: string;
  transactions: number;
  revenue: number;
}

export interface AzureTopProduct {
  name: string;
  sales: number;
}

const API_BASE_URL = '/api/azure-sql';

export async function getKPIs(days: number = 30): Promise<AzureKPIData> {
  const response = await fetch(`${API_BASE_URL}/kpis?days=${days}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch KPIs: ${response.statusText}`);
  }
  return response.json();
}

export async function getTransactions(limit: number = 10): Promise<AzureTransaction[]> {
  const response = await fetch(`${API_BASE_URL}/transactions?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }
  return response.json();
}

export async function getTrends(days: number = 30): Promise<AzureTrend[]> {
  const response = await fetch(`${API_BASE_URL}/trends?days=${days}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch trends: ${response.statusText}`);
  }
  return response.json();
}

export async function getTopProducts(days: number = 30): Promise<AzureTopProduct[]> {
  const response = await fetch(`${API_BASE_URL}/top-products?days=${days}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch top products: ${response.statusText}`);
  }
  return response.json();
}
