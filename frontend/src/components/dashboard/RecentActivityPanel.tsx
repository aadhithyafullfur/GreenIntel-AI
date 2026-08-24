import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, CheckCircle, Bookmark, Download, Clock, FileText } from 'lucide-react';
import type { ActivityItem } from '../../types/analytics';

interface RecentActivityPanelProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({ activities, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'uploaded' | 'evaluated' | 'saved' | 'downloaded'>('all');

  const filteredActivities = activities.filter((act) => {
    if (activeTab === 'all') return true;
    return act.type === activeTab;
  });

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'uploaded':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'evaluated':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'saved':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'downloaded':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'uploaded': return FileUp;
      case 'evaluated': return CheckCircle;
      case 'saved': return Bookmark;
      case 'downloaded': return Download;
      default: return FileText;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-card-base border border-border-base backdrop-blur-xl shadow-sm flex flex-col justify-between h-[380px]">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/10">
        <div>
          <h3 className="text-sm font-bold text-text-main tracking-tight">
            Recent Activity Feed
          </h3>
          <p className="text-[11px] text-text-muted">
            Telemetry audit logs across upload, evaluation, and report actions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5 self-start sm:self-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'uploaded', label: 'Uploaded' },
            { id: 'evaluated', label: 'Evaluated' },
            { id: 'saved', label: 'Saved' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${activeTab === tab.id
                  ? 'bg-white dark:bg-white/10 text-text-main shadow-xs border border-black/5 dark:border-white/10'
                  : 'text-text-muted hover:text-text-main'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Item List */}
      <div className="flex-grow overflow-y-auto space-y-2 py-2 pr-1 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-neutral-200 dark:bg-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Clock className="w-8 h-8 text-text-muted/50 mb-1" />
            <p className="text-xs text-text-muted font-medium">No activity records found</p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const Icon = getTypeIcon(act.type);
            const badgeStyle = getBadgeStyle(act.type);
            return (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] border border-black/[0.03] dark:border-white/[0.05] transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg border ${badgeStyle} shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-text-main truncate block group-hover:text-primary transition-colors">
                      {act.filename}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted">
                      <span>{act.documentType}</span>
                      <span>•</span>
                      <span>{act.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {act.score !== undefined && act.score !== null && (
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {act.score}/100
                    </span>
                  )}
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                    {act.type}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
