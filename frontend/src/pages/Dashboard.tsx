import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import {
  Brain, ShieldCheck, Activity, BarChart3, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { KPICard } from '../components/dashboard/KPICard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { HeatmapChart } from '../components/dashboard/HeatmapChart';
import { TimelineWidget } from '../components/dashboard/TimelineWidget';
import { RecentActivityPanel } from '../components/dashboard/RecentActivityPanel';
import { TopReportsPanel } from '../components/dashboard/TopReportsPanel';
import { AIInsightsPanel } from '../components/dashboard/AIInsightsPanel';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import {
  getDashboardOverview,
  getDashboardCharts,
  getRecentActivity,
  getDocumentInsights,
  getTopReports,
  exportDashboardData
} from '../services/analyticsService';
import type {
  OverviewKPIs,
  ChartDatasets,
  ActivityItem,
  AIInsight,
  TopReportsData,
  FilterOptions
} from '../types/analytics';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    docType: 'all',
    status: 'all',
    month: 'all',
    year: '2026',
    searchQuery: ''
  });

  // Data State
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [charts, setCharts] = useState<ChartDatasets | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [topReports, setTopReports] = useState<TopReportsData | null>(null);

  const loadDashboardData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [kpiRes, chartRes, activityRes, insightRes, topRes] = await Promise.all([
        getDashboardOverview(filters),
        getDashboardCharts(filters),
        getRecentActivity(20),
        getDocumentInsights(),
        getTopReports()
      ]);

      setKpis(kpiRes);
      setCharts(chartRes);
      setActivities(activityRes);
      setInsights(insightRes);
      setTopReports(topRes);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [filters.dateRange, filters.docType, filters.status]);

  // Filter activity feed with search query
  const filteredActivities = useMemo(() => {
    if (!filters.searchQuery.trim()) return activities;
    const q = filters.searchQuery.toLowerCase();
    return activities.filter(
      (a) =>
        a.filename.toLowerCase().includes(q) ||
        a.documentType.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
    );
  }, [activities, filters.searchQuery]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      try {
        const blob = await exportDashboardData('csv');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GreenIntel_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error('Export CSV error:', err);
      }
    } else {
      window.print();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12 print:p-0"
    >
      {/* Top Header Command Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-purple-500/10 border border-black/10 dark:border-white/10 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                Intelligent Analytics Command Center
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Live MongoDB Atlas Telemetry
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Welcome back, <span className="font-bold text-text-main">{user?.name || 'Sustainability Officer'}</span>. Automated IGBC document compliance evaluation intelligence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-mono font-bold text-text-main">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>MongoDB Atlas Connected</span>
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <DashboardFilters
        filters={filters}
        onChange={setFilters}
        onRefresh={() => loadDashboardData(true)}
        onExport={handleExport}
        isRefreshing={isRefreshing}
      />

      {/* TOP KPI SECTION - 13 Animated Enterprise KPI Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" /> Key Performance Indicators (13 Core Metrics)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {kpis ? (
            Object.keys(kpis).map((key) => (
              <KPICard
                key={key}
                kpiKey={key}
                data={(kpis as any)[key]}
                isLoading={isLoading}
              />
            ))
          ) : (
            Array.from({ length: 13 }).map((_, i) => (
              <KPICard key={i} kpiKey="total_reports_processed" data={{} as any} isLoading={true} />
            ))
          )}
        </div>
      </div>

      {/* TOP PERFORMING REPORTS PANEL */}
      <div className="space-y-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Top Performing Reports Summary
        </h2>
        {topReports && <TopReportsPanel reports={topReports} isLoading={isLoading} />}
      </div>

      {/* ANALYTICS SECTION - 9 Interactive Visual Charts */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-primary" /> Comprehensive Analytics & Visualizations
        </h2>

        {/* Row 1: Chart 1 (Monthly Upload Area) & Chart 2 (Monthly Evaluation Line) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Monthly Upload Trend */}
          <ChartCard
            title="Chart 1: Monthly Upload Trend"
            subtitle="Volume of PDF compliance documents uploaded over time"
            infoTooltip="Aggregates monthly document ingestion pipelines in MongoDB Atlas"
            isLoading={isLoading}
          >
            {charts && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyUploadTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="uploads" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#uploadGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Chart 2: Monthly Evaluation Trend */}
          <ChartCard
            title="Chart 2: Monthly Evaluation Trend"
            subtitle="Completed IGBC rule checklist evaluations per month"
            infoTooltip="Tracks evaluated document completion throughput"
            isLoading={isLoading}
          >
            {charts && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.monthlyEvaluationTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="evaluations" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Row 2: Chart 3 (Doc Distribution Pie) & Chart 4 (Compliance Donut) & Chart 5 (Score Trend Line) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chart 3: Document Distribution (Pie) */}
          <ChartCard
            title="Chart 3: Document Distribution"
            subtitle="Energy, Water, Waste, Audit & Compliance"
            infoTooltip="Categorical breakdown of submitted sustainability reports"
            isLoading={isLoading}
          >
            {charts && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.documentDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {charts.documentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Chart 4: Compliance Distribution (Donut) */}
          <ChartCard
            title="Chart 4: Compliance Distribution"
            subtitle="Excellent, Compliant, Partial, Non-Compliant"
            infoTooltip="IGBC score bracket distribution"
            isLoading={isLoading}
          >
            {charts && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.complianceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.complianceDistribution.map((entry, index) => (
                      <Cell key={`cell-comp-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Chart 5: Compliance Score Trend */}
          <ChartCard
            title="Chart 5: Compliance Score Trend"
            subtitle="Average compliance score progression over time"
            infoTooltip="Average score vs 85 point gold target benchmark"
            isLoading={isLoading}
          >
            {charts && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.complianceScoreTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis domain={[50, 100]} stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#3B82F6" strokeWidth={3} />
                  <Line type="monotone" dataKey="targetScore" name="Target (85)" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Row 3: Chart 6 (AI Rec Bar) & Chart 7 (Processing Latency Bar) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 6: AI Recommendation Statistics */}
          <ChartCard
            title="Chart 6: AI Recommendation Statistics"
            subtitle="Most common AI recommendation categories generated"
            infoTooltip="Horizontal bar chart of top optimization advice types"
            isLoading={isLoading}
          >
            {charts && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.aiRecommendationStats} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis type="number" stroke="#888888" fontSize={11} />
                  <YAxis dataKey="category" type="category" stroke="#888888" fontSize={10} tickLine={false} width={130} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Chart 7: Processing Performance */}
          <ChartCard
            title="Chart 7: Processing Performance"
            subtitle="Average processing latency (seconds) by document type"
            infoTooltip="System latency across PDF text extraction and classification"
            isLoading={isLoading}
          >
            {charts && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.processingPerformance} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="docType" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="avgTime" name="Avg Latency (sec)" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Row 4: Chart 8 (Heatmap) & Chart 9 (Timeline) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 8: Heatmap (Month vs Document Type) */}
          <ChartCard
            title="Chart 8: Ingestion Frequency Heatmap"
            subtitle="Month vs Document Type processing matrix grid"
            infoTooltip="Visual density matrix showing processing intensity"
            isLoading={isLoading}
          >
            {charts && <HeatmapChart data={charts.heatmapData} />}
          </ChartCard>

          {/* Chart 9: Interactive Process Timeline */}
          <ChartCard
            title="Chart 9: Pipeline Sequence Timeline"
            subtitle="Interactive 5-stage document evaluation sequence"
            infoTooltip="Upload → Extraction → Classification → Evaluation → Completed"
            isLoading={isLoading}
          >
            {charts && <TimelineWidget steps={charts.timelineData} />}
          </ChartCard>
        </div>
      </div>

      {/* RECENT ACTIVITY & DOCUMENT INSIGHTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity Panel */}
        <RecentActivityPanel activities={filteredActivities} isLoading={isLoading} />

        {/* AI Sustainability Insights Panel */}
        <AIInsightsPanel insights={insights} isLoading={isLoading} />
      </div>
    </motion.div>
  );
};

export default Dashboard;
