import React from 'react';
import { Search, Calendar, FileText, CheckCircle, Download, RefreshCw } from 'lucide-react';
import type { FilterOptions } from '../../types/analytics';
import { CustomSelect } from '../common/CustomSelect';

interface DashboardFiltersProps {
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'pdf') => void;
  isRefreshing?: boolean;
}

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'ytd', label: 'Year to Date' }
];

const DOC_TYPE_OPTIONS = [
  { value: 'all', label: 'All Document Types' },
  { value: 'energy', label: 'Energy Reports' },
  { value: 'water', label: 'Water Reports' },
  { value: 'waste', label: 'Waste Reports' },
  { value: 'audit', label: 'Audit Reports' },
  { value: 'compliance', label: 'Compliance Reports' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'compliant', label: 'Compliant' },
  { value: 'partially compliant', label: 'Partially Compliant' },
  { value: 'non-compliant', label: 'Non-Compliant' }
];

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
        <div className="w-36">
          <CustomSelect
            value={filters.dateRange}
            onChange={(val) => onChange({ ...filters, dateRange: val })}
            options={DATE_RANGE_OPTIONS}
            icon={Calendar}
            size="sm"
            ariaLabel="Filter by Date Range"
          />
        </div>

        {/* Document Type Selector */}
        <div className="w-44">
          <CustomSelect
            value={filters.docType}
            onChange={(val) => onChange({ ...filters, docType: val })}
            options={DOC_TYPE_OPTIONS}
            icon={FileText}
            size="sm"
            ariaLabel="Filter by Document Type"
          />
        </div>

        {/* Compliance Status Selector */}
        <div className="w-40">
          <CustomSelect
            value={filters.status}
            onChange={(val) => onChange({ ...filters, status: val })}
            options={STATUS_OPTIONS}
            icon={CheckCircle}
            size="sm"
            ariaLabel="Filter by Compliance Status"
          />
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
