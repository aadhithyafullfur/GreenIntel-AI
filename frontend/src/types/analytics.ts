export interface KPIItem {
  title: string;
  value: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  sparkline: number[];
  unit: string;
}

export interface OverviewKPIs {
  total_reports_processed: KPIItem;
  energy_reports: KPIItem;
  water_reports: KPIItem;
  waste_reports: KPIItem;
  audit_reports: KPIItem;
  compliance_reports: KPIItem;
  avg_compliance_score: KPIItem;
  highest_compliance_score: KPIItem;
  lowest_compliance_score: KPIItem;
  pending_evaluations: KPIItem;
  saved_reports: KPIItem;
  ai_recommendations_generated: KPIItem;
  avg_processing_time: KPIItem;
}

export interface UploadTrendData {
  month: string;
  uploads: number;
}

export interface EvalTrendData {
  month: string;
  evaluations: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ComplianceDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ScoreTrendData {
  month: string;
  avgScore: number;
  targetScore: number;
}

export interface AIRecommendationStat {
  category: string;
  count: number;
}

export interface LatencyPerformance {
  docType: string;
  avgTime: number;
  targetTime: number;
}

export interface HeatmapRow {
  month: string;
  Energy: number;
  Water: number;
  Waste: number;
  Audit: number;
  Compliance: number;
  [key: string]: string | number;
}

export interface TimelineStep {
  step: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  time: string;
  detail: string;
}

export interface ChartDatasets {
  monthlyUploadTrend: UploadTrendData[];
  monthlyEvaluationTrend: EvalTrendData[];
  documentDistribution: CategoryDistribution[];
  complianceDistribution: ComplianceDistribution[];
  complianceScoreTrend: ScoreTrendData[];
  aiRecommendationStats: AIRecommendationStat[];
  processingPerformance: LatencyPerformance[];
  heatmapData: HeatmapRow[];
  timelineData: TimelineStep[];
}

export interface ActivityItem {
  id: string;
  type: 'uploaded' | 'evaluated' | 'saved' | 'downloaded';
  filename: string;
  documentType: string;
  score?: number;
  status: string;
  timestamp: string;
  date: string;
  user: string;
}

export interface AIInsight {
  id: string;
  type: 'positive' | 'trend' | 'warning' | 'recommendation';
  category: string;
  title: string;
  description: string;
  impact: string;
  action: string;
}

export interface TopReportItem {
  id: string;
  title: string;
  filename: string;
  documentType: string;
  score: number;
  status: string;
  date: string;
  views?: number;
}

export interface TopReportsData {
  highestScore: TopReportItem;
  lowestScore: TopReportItem;
  mostViewed: TopReportItem;
  recentlyGenerated: TopReportItem;
}

export interface FilterOptions {
  dateRange: string;
  docType: string;
  status: string;
  month: string;
  year: string;
  searchQuery: string;
}
