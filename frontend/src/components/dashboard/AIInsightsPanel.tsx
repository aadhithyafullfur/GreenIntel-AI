import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import type { AIInsight } from '../../types/analytics';

interface AIInsightsPanelProps {
  insights: AIInsight[];
  isLoading?: boolean;
}

const getInsightBadge = (type: AIInsight['type']) => {
  switch (type) {
    case 'positive':
      return { icon: CheckCircle2, style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    case 'trend':
      return { icon: TrendingUp, style: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    case 'warning':
      return { icon: AlertTriangle, style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    case 'recommendation':
      return { icon: Lightbulb, style: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
  }
};

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights, isLoading }) => {
  return (
    <div className="p-5 rounded-2xl bg-card-base border border-border-base backdrop-blur-xl shadow-sm flex flex-col justify-between h-[380px]">
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main tracking-tight">
              AI Sustainability Insights
            </h3>
            <p className="text-[11px] text-text-muted">
              Autonomous reasoning synthesized from IGBC compliance telemetry
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          Groq AI Engine
        </span>
      </div>

      {/* Insights Cards */}
      <div className="flex-grow overflow-y-auto space-y-3 py-3 pr-1 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-neutral-200 dark:bg-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          insights.map((ins) => {
            const { icon: Icon, style } = getInsightBadge(ins.type);
            return (
              <motion.div
                key={ins.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.05] transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${style}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-text-main">
                      {ins.title}
                    </span>
                  </div>
                  <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-white/10 text-text-muted">
                    {ins.category}
                  </span>
                </div>

                <p className="text-[11px] text-text-muted leading-relaxed">
                  "{ins.description}"
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-primary">
                    Action: {ins.action}
                  </span>
                  <span className="font-bold text-text-muted">
                    {ins.impact}
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
