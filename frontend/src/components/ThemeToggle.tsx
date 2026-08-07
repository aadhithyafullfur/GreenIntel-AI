import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-text-muted hover:text-text-main bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/10 rounded-xl transition-all cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/20"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 180 : 0,
          scale: theme === 'dark' ? 0 : 1,
          opacity: theme === 'dark' ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={theme === 'dark' ? 'absolute' : 'relative'}
      >
        <Sun className="w-4 h-4 text-orange-500" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 0 : -180,
          scale: theme === 'dark' ? 1 : 0,
          opacity: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={theme === 'dark' ? 'relative' : 'absolute'}
      >
        <Moon className="w-4 h-4 text-orange-400" />
      </motion.div>
    </button>
  );
};

export default ThemeToggle;