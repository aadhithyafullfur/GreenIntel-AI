import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, FileText, Zap, Droplets, Trash2,
  CheckCircle2, Award, AlertTriangle, ShieldCheck, Clock, Bookmark, Sparkles, Activity
} from 'lucide-react';
import type { KPIItem } from '../../types/analytics';

interface KPICardProps {
  kpiKey: string;
  data: KPIItem;
  isLoading?: boolean;
}

const getIconForKey = (key: string) => {
  switch (key) {
    case 'total_reports_processed': return FileText;
    case 'energy_reports': return Zap;
    case 'water_reports': return Droplets;
    case 'waste_reports': return Trash2;
    case 'audit_reports': return CheckCircle2;
    case 'compliance_reports': return ShieldCheck;
    case 'avg_compliance_score': return Award;
    case 'highest_compliance_score': return Award;
    case 'lowest_compliance_score': return AlertTriangle;
    case 'pending_evaluations': return Clock;
    case 'saved_reports': return Bookmark;
    case 'ai_recommendations_generated': return Sparkles;
    case 'avg_processing_time': return Activity;
    default: return FileText;
  }
};

const getColorForKey = (key: string) => {
  switch (key) {
    case 'total_reports_processed': return 'from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/30';
    case 'energy_reports': return 'from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30';
    case 'water_reports': return 'from-cyan-500/20 to-teal-500/20 text-cyan-500 border-cyan-500/30';
    case 'waste_reports': return 'from-emerald-500/20 to-green-500/20 text-emerald-500 border-emerald-500/30';
    case 'audit_reports': return 'from-purple-500/20 to-violet-500/20 text-purple-500 border-purple-500/30';
    case 'compliance_reports': return 'from-rose-500/20 to-pink-500/20 text-rose-500 border-rose-500/30';
    case 'avg_compliance_score': return 'from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30';
    case 'highest_compliance_score': return 'from-green-500/20 to-emerald-500/20 text-green-500 border-green-500/30';
    case 'lowest_compliance_score': return 'from-rose-500/20 to-red-500/20 text-rose-500 border-rose-500/30';
    case 'pending_evaluations': return 'from-amber-500/20 to-yellow-500/20 text-amber-500 border-amber-500/30';
    case 'saved_reports': return 'from-sky-500/20 to-blue-500/20 text-sky-500 border-sky-500/30';
    case 'ai_recommendations_generated': return 'from-purple-500/20 to-fuchsia-500/20 text-purple-500 border-purple-500/30';
    case 'avg_processing_time': return 'from-teal-500/20 to-cyan-500/20 text-teal-500 border-teal-500/30';
    default: return 'from-primary/20 to-rose-500/20 text-primary border-primary/30';
  }
};

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const frameRate = 30;
    const totalFrames = Math.round((duration / 1000) * frameRate);
    const increment = (value - start) / totalFrames;

    let currentFrame = 0;
    const timer = setInterval(() => {
      currentFrame++;
      start += increment;
      if (currentFrame >= totalFrames) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Number(start.toFixed(value % 1 !== 0 ? 1 : 0)));
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const RenderSparkline: React.FC<{ points: number[]; colorClass: string }> = ({ points, colorClass }) => {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;

  const width = 80;
  const height = 28;

  const pathPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const pathD = `M ${pathPoints.join(' L ')}`;

  const isStrokeGreen = colorClass.includes('emerald') || colorClass.includes('green') || colorClass.includes('cyan');
  const strokeColor = isStrokeGreen ? '#10B981' : '#F97316';

  return (
    <svg width={width} height={height} className="overflow-visible opacity-85">
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const KPICard: React.FC<KPICardProps> = ({ kpiKey, data, isLoading }) => {
  const IconComponent = getIconForKey(kpiKey);
  const colorStyle = getColorForKey(kpiKey);

  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 backdrop-blur-xl animate-pulse h-36 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-neutral-300 dark:bg-white/10 rounded"></div>
          <div className="w-8 h-8 rounded-xl bg-neutral-300 dark:bg-white/10"></div>
        </div>
        <div className="h-8 w-20 bg-neutral-300 dark:bg-white/10 rounded my-2"></div>
        <div className="h-3 w-36 bg-neutral-300 dark:bg-white/10 rounded"></div>
      </div>
    );
  }

  const isPositiveTrend = data.trendDirection === 'up';
  const isNegativeTrend = data.trendDirection === 'down';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative group p-4 rounded-2xl bg-white/70 dark:bg-black/50 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
    >
      {/* Top subtle gradient glow line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colorStyle}`} />

      {/* Card Header: Title & Icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-text-muted tracking-tight line-clamp-1">
          {data.title}
        </span>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${colorStyle} border shadow-inner flex items-center justify-center shrink-0`}>
          <IconComponent className="w-4 h-4" />
        </div>
      </div>

      {/* Main KPI Value */}
      <div className="my-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold text-text-main tracking-tight font-mono">
          <AnimatedNumber value={data.value} />
        </span>
        {data.unit && (
          <span className="text-[11px] font-medium text-text-muted">
            {data.unit}
          </span>
        )}
      </div>

      {/* Card Footer: Trend Badge & Sparkline */}
      <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
        {/* Trend Indicator */}
        <div className="flex items-center gap-1">
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isPositiveTrend
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : isNegativeTrend
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20'
              }`}
          >
            {isPositiveTrend && <TrendingUp className="w-3 h-3" />}
            {isNegativeTrend && <TrendingDown className="w-3 h-3" />}
            {!isPositiveTrend && !isNegativeTrend && <Minus className="w-3 h-3" />}
            {data.trend > 0 ? `+${data.trend}%` : `${data.trend}%`}
          </span>
          <span className="text-[9.5px] text-text-muted font-normal">vs prev</span>
        </div>

        {/* Mini Sparkline */}
        <RenderSparkline points={data.sparkline} colorClass={colorStyle} />
      </div>
    </motion.div>
  );
};
