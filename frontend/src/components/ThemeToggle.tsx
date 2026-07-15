import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg border border-border-base hover:bg-orange-50/40 dark:hover:bg-white/5 text-text-main transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -8, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 8, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          {theme === 'light' ? (
            <Sun className="w-4.5 h-4.5 text-orange-500" strokeWidth={2} />
          ) : (
            <Moon className="w-4.5 h-4.5 text-orange-400" strokeWidth={2} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
  