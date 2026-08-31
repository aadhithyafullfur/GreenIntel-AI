import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Info } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  infoTooltip?: string;
  children: React.ReactNode;
  actionControl?: React.ReactNode;
  heightClass?: string;
  isLoading?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  infoTooltip,
  children,
  actionControl,
  heightClass = 'h-[320px]',
  isLoading = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <motion.div
        layout
        className={`relative p-5 rounded-2xl bg-card-base border border-border-base backdrop-blur-xl shadow-sm flex flex-col justify-between overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-32px)] bg-bg-base shadow-2xl' : heightClass
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 mb-3 z-10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-main tracking-tight flex items-center gap-1.5 font-display">
                {title}
              </h3>
              {infoTooltip && (
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowInfo(true)}
                    onMouseLeave={() => setShowInfo(false)}
                    className="text-text-muted hover:text-text-main cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {showInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-0 bottom-full mb-1.5 w-56 p-2.5 glass-dropdown-surface text-text-main text-[11px] font-medium rounded-xl shadow-xl border border-border-base z-30 pointer-events-none"
                      >
                        {infoTooltip}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] font-medium text-text-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Action Tools & Fullscreen button */}
          <div className="flex items-center gap-2">
            {actionControl}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-text-muted hover:text-text-main bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] rounded-lg border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Chart View Content */}
        <div className="relative w-full flex-grow flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs text-text-muted font-medium">Aggregating telemetry...</span>
            </div>
          ) : (
            children
          )}
        </div>
      </motion.div>

      {/* Backdrop overlay when fullscreen */}
      {isFullscreen && (
        <div
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
        />
      )}
    </>
  );
};

export default ChartCard;
