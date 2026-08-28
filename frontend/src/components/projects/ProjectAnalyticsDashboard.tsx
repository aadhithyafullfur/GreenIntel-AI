import React, { useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
  Zap, Droplets, Trash, Award, Sparkles, AlertTriangle, ArrowRight, Flame
} from 'lucide-react';
import { AIChatbotIcon } from '../common/AIChatbotIcon';
import type { Project, ProjectAnalytics } from '../../types/project';
import { DocumentRelationshipGraph } from './DocumentRelationshipGraph';
import { useTheme } from '../../context/ThemeContext';

interface ProjectAnalyticsDashboardProps {
  project: Project;
  analytics: ProjectAnalytics | null;
  documents: any[];
  isLoading: boolean;
  onAnalyzeProject: () => void;
  isAnalyzing: boolean;
  onSelectDocument?: (doc: any) => void;
}

export const ProjectAnalyticsDashboard: React.FC<ProjectAnalyticsDashboardProps> = ({
  project,
  analytics,
  documents,
  isLoading,
  onAnalyzeProject,
  isAnalyzing,
  onSelectDocument
}) => {
  const { theme } = useTheme();

  const tooltipStyle = useMemo(() => (
    theme === 'dark'
      ? { background: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }
      : { background: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }
  ), [theme]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-card-base border border-border-base rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-card-base border border-border-base rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis;
  const health = analytics?.health;
  const metrics = analytics?.sustainability_metrics;
  const hotspots = analytics?.hotspots || {};
  const priorityActions = analytics?.priority_actions || [];

  // Multi-Color Data Visualization Palette
  const DOC_COLORS = ['#F97316', '#06B6D4', '#10B981', '#8B5CF6', '#EF4444'];

  const docDistributionData = analytics?.document_distribution
    ? Object.entries(analytics.document_distribution).map(([name, value], i) => ({
        name,
        value,
        color: DOC_COLORS[i % DOC_COLORS.length]
      }))
    : [];

  const ruleStatsData = kpis
    ? [
        { name: 'Passed Rules', count: kpis.passed_rules, fill: '#10B981' },
        { name: 'Partial Rules', count: kpis.partial_rules, fill: '#F59E0B' },
        { name: 'Failed Rules', count: kpis.failed_rules, fill: '#EF4444' }
      ]
    : [];

  const docPerformanceData = documents.map(d => ({
    filename: d.filename,
    score: d.compliance_score || 0,
    rawDoc: d
  }));

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-500 border-red-500/30 font-extrabold';
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-500 border-rose-500/30 font-bold';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30 font-medium';
      case 'LOW':
        return 'bg-blue-500/15 text-blue-500 border-blue-500/30 font-normal';
      default:
        return 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30';
    }
  };

  return (
    <div className="space-y-8 pb-12 text-text-main">
      {/* Top Banner Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-purple-500/10 border border-black/10 dark:border-white/10 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <AIChatbotIcon size="lg" glow animated />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-text-main font-display">
                Project Sustainability Command Center
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                MongoDB Scoped Telemetry
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5 font-sans">
              Strictly aggregated real metrics from {documents.length} project document{documents.length !== 1 ? 's' : ''}.
            </p>
          </div>
        </div>

        <button
          onClick={onAnalyzeProject}
          disabled={isAnalyzing || documents.length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing Project...' : 'ANALYZE PROJECT'}</span>
        </button>
      </div>

      {/* 1. PROJECT HEALTH SCORE & PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Gauge */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-card-base border border-border-base shadow-sm space-y-4 flex flex-col justify-between orange-glow">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans">
              Project Health Score
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Transparent Calculation
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-2">
            <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-primary/20 bg-primary/5">
              <div className="text-center">
                <span className="text-4xl font-black font-display text-text-main">
                  {health?.score !== undefined ? health.score : 0}
                </span>
                <span className="text-xs font-bold text-text-muted block font-sans">/ 100</span>
              </div>
            </div>
            <span className="mt-3 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              {health?.badge || 'No Data'}
            </span>
          </div>

          <div className="space-y-2 pt-3 border-t border-border-base/60 text-[11px] font-medium">
            <div className="flex justify-between">
              <span className="text-text-muted">Overall Compliance (70%)</span>
              <span className="text-text-main font-bold">{health?.overall_compliance || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Document Completeness (30%)</span>
              <span className="text-text-main font-bold">{health?.breakdown?.document_completeness || 0}%</span>
            </div>
          </div>
        </div>

        {/* Sub-Category Performance Breakdown Grid */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-card-base border border-border-base shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans">
            Sub-Category Performance Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Energy</span>
              <div className="text-lg font-extrabold text-orange-500 font-display">
                {health?.breakdown?.energy_performance ? `${health.breakdown.energy_performance}%` : 'Not Uploaded'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Water</span>
              <div className="text-lg font-extrabold text-cyan-500 font-display">
                {health?.breakdown?.water_performance ? `${health.breakdown.water_performance}%` : 'Not Uploaded'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Waste</span>
              <div className="text-lg font-extrabold text-emerald-500 font-display">
                {health?.breakdown?.waste_performance ? `${health.breakdown.waste_performance}%` : 'Not Uploaded'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Compliance</span>
              <div className="text-lg font-extrabold text-purple-500 font-display">
                {health?.breakdown?.compliance_performance ? `${health.breakdown.compliance_performance}%` : 'Not Uploaded'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-text-muted leading-relaxed font-sans">
            <span className="font-bold text-primary">Calculation Methodology:</span> Project Health is derived using a weighted score combining real compliance evaluations with required document category coverage. Missing report categories lower the completeness index.
          </div>
        </div>
      </div>

      {/* 2. PROJECT KPI GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans">
          Project Key Performance Indicators
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Docs</span>
            <div className="text-xl font-bold text-text-main font-display">{kpis?.total_documents || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Completed Docs</span>
            <div className="text-xl font-bold text-emerald-500 font-display">{kpis?.completed_documents || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Issues</span>
            <div className="text-xl font-bold text-amber-500 font-display">{kpis?.total_issues || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Critical Issues</span>
            <div className="text-xl font-bold text-rose-500 font-display">{kpis?.critical_issues || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Overall Score</span>
            <div className="text-xl font-bold text-primary font-display">{kpis?.overall_compliance_score || 0}%</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Avg Score</span>
            <div className="text-xl font-bold text-text-main font-display">{kpis?.average_compliance_score || 0}</div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS GRID (Pie & Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Ingestion Distribution (Pie) */}
        <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans">
            Project Document Taxonomy Distribution
          </h3>

          {docDistributionData.every((d) => d.value === 0) ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-border-base rounded-2xl text-xs text-text-muted">
              Data unavailable (No documents uploaded)
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={docDistributionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {docDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Rule Check Breakdown (Bar) */}
        <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans">
            Compliance Checklist Status Breakdown
          </h3>

          {ruleStatsData.every((d) => d.count === 0) ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-border-base rounded-2xl text-xs text-text-muted">
              Data unavailable (No compliance rules evaluated)
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ruleStatsData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {ruleStatsData.map((entry, index) => (
                      <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 4. DOCUMENT PERFORMANCE & HOTSPOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Performance Bar Chart */}
        <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans flex items-center justify-between">
            <span>Document Compliance Scores</span>
            <span className="text-[10px] text-primary">Click bar to view analysis</span>
          </h3>

          {docPerformanceData.length === 0 ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-border-base rounded-2xl text-xs text-text-muted">
              No documents uploaded yet
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={docPerformanceData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="filename" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="score"
                    radius={[8, 8, 0, 0]}
                    fill="#F97316"
                    onClick={(entry: any) => {
                      if (entry && entry.rawDoc && onSelectDocument) {
                        onSelectDocument(entry.rawDoc);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Compliance Hotspots */}
        <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans">
              Compliance Hotspots (Focus Priority)
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(hotspots).map(([category, count]) => {
              const total = (kpis?.total_issues || 1) || 1;
              const pct = Math.round(((count as number) / total) * 100);
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-text-main">{category}</span>
                    <span className="font-extrabold text-rose-500 font-mono">{count as number} issue{(count as number) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500"
                      style={{ width: `${Math.max(pct, count ? 10 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. TOP PRIORITY ACTIONS */}
      <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans">
              Top Priority Corrective Actions ({priorityActions.length})
            </h3>
          </div>
          <span className="text-[10px] text-text-muted">Sorted by Severity</span>
        </div>

        {priorityActions.length === 0 ? (
          <p className="text-xs text-text-muted py-8 text-center border border-dashed border-border-base rounded-2xl">
            No priority issues detected across project documents.
          </p>
        ) : (
          <div className="space-y-3">
            {priorityActions.slice(0, 5).map((action: any, idx: number) => {
              const matchedDoc = documents.find(d => (d._id || d.id) === action.document_id || d.filename === action.filename);
              return (
                <div
                  key={idx}
                  onClick={() => matchedDoc && onSelectDocument?.(matchedDoc)}
                  className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-base hover:border-primary/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase shrink-0 ${getSeverityBadge(action.severity)}`}>
                      {action.severity}
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold text-text-main group-hover:text-primary transition-colors">
                        {action.metric}: {action.explanation}
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Source: <span className="font-semibold text-text-main">{action.filename}</span> • Expected: <span className="font-mono text-emerald-500 font-bold">{action.expected_value}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-primary flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform">
                    View Analysis <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. REAL SUSTAINABILITY EXTRACTED METRICS SUMMARY */}
      <div className="bg-card-base border border-border-base rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <span>Extracted Project Sustainability Metrics (Real Data Only)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Energy Metrics Card */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between border-b border-border-base/60 pb-2">
              <span className="text-xs font-extrabold text-orange-500 flex items-center gap-1.5 font-display">
                <Zap className="w-4 h-4" /> Energy Performance
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                {metrics?.energy ? metrics.energy.filename : 'Not uploaded'}
              </span>
            </div>

            {metrics?.energy ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Annual Consumption:</span>
                  <span className="font-bold text-text-main">{metrics.energy.annual_energy_consumption || 'Data unavailable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Renewable Energy:</span>
                  <span className="font-bold text-emerald-500">{metrics.energy.renewable_energy_percentage || 'Data unavailable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Carbon Emissions:</span>
                  <span className="font-bold text-text-main">{metrics.energy.carbon_emissions || 'Data unavailable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Energy Intensity:</span>
                  <span className="font-bold text-text-main">{metrics.energy.energy_intensity || 'Data unavailable'}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-text-muted">
                Energy Report Not Uploaded
              </div>
            )}
          </div>

          {/* Water Metrics Card */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between border-b border-border-base/60 pb-2">
              <span className="text-xs font-extrabold text-cyan-500 flex items-center gap-1.5 font-display">
                <Droplets className="w-4 h-4" /> Water Conservation
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                {metrics?.water ? metrics.water.filename : 'Not uploaded'}
              </span>
            </div>

            {metrics?.water ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Water Usage:</span>
                  <span className="font-bold text-text-main">{metrics.water.total_water_consumption || 'Data unavailable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Recycled Water %:</span>
                  <span className="font-bold text-emerald-500">{metrics.water.water_recycling_percentage || 'Data unavailable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Rainwater Harvesting:</span>
                  <span className="font-bold text-text-main">{metrics.water.rainwater_harvesting_capacity || 'Data unavailable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Water Savings:</span>
                  <span className="font-bold text-cyan-500">{metrics.water.water_savings || 'Data unavailable'}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-text-muted">
                Water Report Not Uploaded
              </div>
            )}
          </div>

          {/* Waste Metrics Card */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between border-b border-border-base/60 pb-2">
              <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-1.5 font-display">
                <Trash className="w-4 h-4" /> Waste Management
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                {metrics?.waste ? metrics.waste.filename : 'Not uploaded'}
              </span>
            </div>

            {metrics?.waste ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Waste Generated:</span>
                  <span className="font-bold text-text-main">{metrics.waste.total_waste_generated || 'Data unavailable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Waste Recycled:</span>
                  <span className="font-bold text-emerald-500">{metrics.waste.waste_recycled || 'Data unavailable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Recycling Percentage:</span>
                  <span className="font-bold text-emerald-500">{metrics.waste.recycling_percentage || 'Data unavailable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Landfill Diversion:</span>
                  <span className="font-bold text-text-main">{metrics.waste.waste_diverted_from_landfill || 'Data unavailable'}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-text-muted">
                Waste Report Not Uploaded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7. INTERACTIVE DOCUMENT RELATIONSHIP TOPOLOGY GRAPH */}
      <DocumentRelationshipGraph project={project} documents={documents} />
    </div>
  );
};

export default ProjectAnalyticsDashboard;
