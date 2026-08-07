import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, AlertCircle, Eye, Sparkles, ArrowRight } from 'lucide-react';
import type { TopReportsData, TopReportItem } from '../../types/analytics';

interface TopReportsPanelProps {
  reports: TopReportsData;
  isLoading?: boolean;
}

export const TopReportsPanel: React.FC<TopReportsPanelProps> = ({ reports, isLoading }) => {
  const cards: { key: keyof TopReportsData; icon: any; color: string; badge: string }[] = [
    {
      key: 'highestScore',
      icon: Trophy,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-500',
      badge: 'Highest Compliance'
    },
    {
      key: 'lowestScore',
      icon: AlertCircle,
      color: 'from-rose-500/20 to-amber-500/20 border-rose-500/30 text-rose-500',
      badge: 'Needs Attention'
    },
    {
      key: 'mostViewed',
      icon: Eye,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-500',
      badge: 'Most Viewed'
    },
    {
      key: 'recentlyGenerated',
      icon: Sparkles,
      color: 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-500',
      badge: 'Latest Evaluation'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-neutral-200 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, icon: Icon, color, badge }) => {
        const item: TopReportItem = reports[key];
        if (!item) return null;

        return (
          <motion.div
            key={key}
            whileHover={{ y: -3 }}
            className={`p-4 rounded-2xl bg-white/70 dark:bg-black/50 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-sm flex flex-col justify-between relative overflow-hidden group`}
          >
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${color}`} />

            <div className="flex items-start justify-between gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border bg-gradient-to-r ${color}`}>
                {badge}
              </span>
              <Icon className="w-4 h-4 text-text-muted" />
            </div>

            <div className="my-2">
              <h4 className="text-xs font-bold text-text-main line-clamp-1 group-hover:text-primary transition-colors">
                {item.filename}
              </h4>
              <p className="text-[10.5px] text-text-muted mt-0.5">
                {item.documentType} • {item.date}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-text-muted">Score:</span>
                <span className="text-xs font-mono font-extrabold text-text-main">
                  {item.score}/100
                </span>
              </div>
              <span className="text-[10px] font-semibold text-text-muted flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                View <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
