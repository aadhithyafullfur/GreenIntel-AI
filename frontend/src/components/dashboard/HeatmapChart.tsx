import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HeatmapRow } from '../../types/analytics';

interface HeatmapChartProps {
  data: HeatmapRow[];
}

const docTypes = ["Energy", "Water", "Waste", "Audit", "Compliance"];

const getCellColor = (val: number) => {
  if (val === 0) return 'bg-neutral-100 dark:bg-white/5 border-black/5 dark:border-white/5 text-text-muted';
  if (val <= 3) return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  if (val <= 7) return 'bg-emerald-500/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/50';
  if (val <= 12) return 'bg-emerald-500/70 text-white border-emerald-500';
  return 'bg-gradient-to-r from-orange-500 to-emerald-500 text-white border-primary shadow-sm shadow-emerald-500/30';
};

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{ month: string; docType: string; val: number } | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-xs text-text-muted">No heatmap data available</div>;
  }

  return (
    <div className="w-full h-full flex flex-col justify-between p-2">
      {/* Header Legend */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted pb-2 border-b border-black/5 dark:border-white/10">
        <span>Month \ Document Type</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>Low</span>
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/20" />
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/50" />
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/80" />
          <span className="w-2.5 h-2.5 rounded bg-gradient-to-r from-orange-500 to-emerald-500" />
          <span>High</span>
        </div>
      </div>

      {/* Grid Table */}
      <div className="grid grid-cols-6 gap-2 my-auto">
        {/* Empty top-left cell */}
        <div className="text-[11px] font-bold text-text-muted flex items-center justify-center">
          Month
        </div>
        {/* Document Type headers */}
        {docTypes.map((dt) => (
          <div key={dt} className="text-[10.5px] font-bold text-text-muted text-center py-1 truncate">
            {dt}
          </div>
        ))}

        {/* Matrix Rows */}
        {data.map((row) => (
          <React.Fragment key={row.month}>
            <div className="text-[11px] font-mono font-bold text-text-main flex items-center justify-center">
              {row.month}
            </div>
            {docTypes.map((dt) => {
              const val = Number(row[dt] || 0);
              const colorClass = getCellColor(val);
              return (
                <div
                  key={`${row.month}-${dt}`}
                  onMouseEnter={() => setHoveredCell({ month: row.month, docType: dt, val })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.15 }}
                    className={`h-9 rounded-xl border flex items-center justify-center text-xs font-extrabold font-mono transition-all duration-200 cursor-pointer ${colorClass}`}
                  >
                    {val}
                  </motion.div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Hover Info Banner */}
      <div className="h-6 flex items-center justify-center">
        <AnimatePresence>
          {hoveredCell ? (
            <motion.div
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              className="text-[11px] font-semibold text-text-main flex items-center gap-2 px-3 py-0.5 rounded-full bg-black/5 dark:bg-white/10"
            >
              <span>{hoveredCell.month}</span>
              <span>•</span>
              <span className="text-primary font-bold">{hoveredCell.docType} Reports:</span>
              <span className="font-mono text-emerald-500 font-extrabold">{hoveredCell.val} processed</span>
            </motion.div>
          ) : (
            <span className="text-[10px] text-text-muted">Hover over cell to inspect processing frequency</span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
