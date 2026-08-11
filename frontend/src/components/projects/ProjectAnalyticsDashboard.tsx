import React, { useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
  Zap, Droplets, Trash, Award, Sparkles, Brain
} from 'lucide-react';
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
}

export const ProjectAnalyticsDashboard: React.FC<ProjectAnalyticsDashboardProps> = ({
  project,
  analytics,
  documents,
  isLoading,
  onAnalyzeProject,
  isAnalyzing
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

  // Colors for real data charts
  const DOC_COLORS = ['#F97316', '#06B6D4', '#10B981', '#8B5CF6', '#EC4899'];

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

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-purple-500/10 border border-black/10 dark:border-white/10 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-text-main font-display">
                Project Sustainability Command Center
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                MongoDB Scoped Real Telemetry
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

      {/* 1. PROJECT HEALTH SCORE & 3D CARD */}
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

        {/* Transparent Score Component Breakdown Grid */}
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

      {/* 2. PROJECT KPI GRID (12 Animated Cards) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans">
          Project Key Performance Indicators (12 Metrics)
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
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Pending Docs</span>
            <div className="text-xl font-bold text-amber-500 font-display">{kpis?.pending_documents || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Overall Score</span>
            <div className="text-xl font-bold text-primary font-display">{kpis?.overall_compliance_score || 0}%</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Avg Score</span>
            <div className="text-xl font-bold text-text-main font-display">{kpis?.average_compliance_score || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Highest Score</span>
            <div className="text-xl font-bold text-emerald-500 font-display">{kpis?.highest_score || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Lowest Score</span>
            <div className="text-xl font-bold text-red-500 font-display">{kpis?.lowest_score || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Classifier Confidence</span>
            <div className="text-xl font-bold text-indigo-500 font-display">
              {kpis?.average_confidence ? `${(kpis.average_confidence * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Rules</span>
            <div className="text-xl font-bold text-text-main font-display">{kpis?.total_compliance_rules || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Passed Rules</span>
            <div className="text-xl font-bold text-emerald-500 font-display">{kpis?.passed_rules || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Partial Rules</span>
            <div className="text-xl font-bold text-amber-500 font-display">{kpis?.partial_rules || 0}</div>
          </div>

          <div className="bg-card-base p-4 rounded-2xl border border-border-base shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Failed Rules</span>
            <div className="text-xl font-bold text-red-500 font-display">{kpis?.failed_rules || 0}</div>
          </div>
        </div>
      </div>

      {/* 3. DOCUMENT & COMPLIANCE DISTRIBUTION CHARTS */}
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

      {/* 4. REAL SUSTAINABILITY EXTRACTED METRICS SUMMARY */}
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

      {/* 5. INTERACTIVE DOCUMENT RELATIONSHIP TOPOLOGY GRAPH */}
      <DocumentRelationshipGraph project={project} documents={documents} />
    </div>
  );
};
