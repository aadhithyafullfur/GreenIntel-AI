import React from 'react';
import { Search, Calendar, FileText, CheckCircle, Download, RefreshCw } from 'lucide-react';
import type { FilterOptions } from '../../types/analytics';

interface DashboardFiltersProps {
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'pdf') => void;
  isRefreshing?: boolean;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onChange,
  onRefresh,
  onExport,
  isRefreshing
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-black/50 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      {/* Global Search Bar */}
      <div className="relative flex-grow max-w-md">
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Search by Document Name, Report Type, Status, or Notes..."
          className="w-full pl-10 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
      </div>

      {/* Filter Selectors Group */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-text-main">
          <Calendar className="w-3.5 h-3.5 text-text-muted" />
          <select
            value={filters.dateRange}
            onChange={(e) => onChange({ ...filters, dateRange: e.target.value })}
            className="bg-transparent focus:outline-none text-xs font-semibold cursor-pointer text-text-main"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>

        {/* Document Type Selector */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-text-main">
          <FileText className="w-3.5 h-3.5 text-text-muted" />
          <select
            value={filters.docType}
            onChange={(e) => onChange({ ...filters, docType: e.target.value })}
            className="bg-transparent focus:outline-none text-xs font-semibold cursor-pointer text-text-main"
          >
            <option value="all">All Document Types</option>
            <option value="energy">Energy Reports</option>
            <option value="water">Water Reports</option>
            <option value="waste">Waste Reports</option>
            <option value="audit">Audit Reports</option>
            <option value="compliance">Compliance Reports</option>
          </select>
        </div>

        {/* Compliance Status Selector */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-text-main">
          <CheckCircle className="w-3.5 h-3.5 text-text-muted" />
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="bg-transparent focus:outline-none text-xs font-semibold cursor-pointer text-text-main"
          >
            <option value="all">All Statuses</option>
            <option value="compliant">Compliant</option>
            <option value="partially compliant">Partially Compliant</option>
            <option value="non-compliant">Non-Compliant</option>
          </select>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-text-muted hover:text-text-main bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl transition-all cursor-pointer"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
        </button>

        {/* Export Dropdown / Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onExport('csv')}
            className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-bold rounded-xl text-text-main flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            CSV / Excel
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-xs shadow-primary/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Executive PDF
          </button>
        </div>
      </div>
    </div>
  );
};
