import api from './api';
import type {
  OverviewKPIs,
  ChartDatasets,
  ActivityItem,
  AIInsight,
  TopReportsData,
  FilterOptions
} from '../types/analytics';

export const getDashboardOverview = async (filters?: Partial<FilterOptions>): Promise<OverviewKPIs> => {
  const params = new URLSearchParams();
  if (filters?.dateRange) params.append('dateRange', filters.dateRange);
  if (filters?.docType) params.append('docType', filters.docType);
  if (filters?.status) params.append('status', filters.status);

  const response = await api.get<{ kpis: OverviewKPIs }>(`/api/dashboard/overview?${params.toString()}`);
  return response.data.kpis;
};

export const getDashboardCharts = async (filters?: Partial<FilterOptions>): Promise<ChartDatasets> => {
  const params = new URLSearchParams();
  if (filters?.dateRange) params.append('dateRange', filters.dateRange);
  if (filters?.docType) params.append('docType', filters.docType);

  const response = await api.get<{ charts: ChartDatasets }>(`/api/dashboard/charts?${params.toString()}`);
  return response.data.charts;
};

export const getRecentActivity = async (limit: number = 15): Promise<ActivityItem[]> => {
  const response = await api.get<{ activities: ActivityItem[] }>(`/api/dashboard/activity?limit=${limit}`);
  return response.data.activities;
};

export const getDocumentInsights = async (): Promise<AIInsight[]> => {
  const response = await api.get<{ insights: AIInsight[] }>(`/api/dashboard/insights`);
  return response.data.insights;
};

export const getTopReports = async (): Promise<TopReportsData> => {
  const response = await api.get<{ topReports: TopReportsData }>(`/api/dashboard/statistics`);
  return response.data.topReports;
};

export const exportDashboardData = async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
  const response = await api.get(`/api/dashboard/export?format=${format}`, {
    responseType: 'blob'
  });
  return response.data;
};
