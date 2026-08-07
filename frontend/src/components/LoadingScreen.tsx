import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const { theme } = useTheme();

  // Fast initial load of 1000ms (1 second)
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const isDark = theme === 'dark';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none transition-colors duration-300 ${
        isDark
          ? 'bg-[#050505] text-white'
          : 'bg-[#FCFCFC] text-gray-900'
      }`}
    >
      {/* Background Soft Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[80px] opacity-15 transition-all duration-300 ${
            isDark ? 'bg-orange-500/35' : 'bg-orange-400/25'
          }`}
        />
      </div>

      {/* Center Layout Container */}
      <div className="relative z-10 flex flex-col items-center space-y-5">
        {/* Minimal Rotating Circular Progress Ring */}
        <div className="relative w-12 h-12">
          {/* Subtle Outer Shadow Ring (Light Mode) or Glow (Dark Mode) */}
          <div
            className={`absolute inset-0 rounded-full blur-[6px] opacity-30 transition-all ${
              isDark ? 'bg-orange-500/20' : 'bg-orange-400/10'
            }`}
          />
          
          <svg className="w-full h-full" viewBox="0 0 50 50">
            {/* Track Circle */}
            <circle
              cx="25"
              cy="25"
              r="21"
              className={isDark ? 'stroke-white/[0.04]' : 'stroke-black/[0.03]'}
              strokeWidth="2"
              fill="none"
            />
            {/* Rotating Segment */}
            <motion.circle
              cx="25"
              cy="25"
              r="21"
              stroke="url(#premium-orange-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              initial={{ strokeDasharray: '30 150', strokeDashoffset: 0 }}
              animate={{
                strokeDasharray: ['30 150', '90 150', '30 150'],
                strokeDashoffset: [0, -35, -120],
                rotate: 360
              }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{ originX: '25px', originY: '25px' }}
            />
            <defs>
              <linearGradient id="premium-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Small Modern Typography Subtitle */}
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`text-[10px] font-bold tracking-[0.16em] uppercase font-sans ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Preparing Workspace
        </motion.span>
      </div>
    </div>
  );
};

export default LoadingScreen;
