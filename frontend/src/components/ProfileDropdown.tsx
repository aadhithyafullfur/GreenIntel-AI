import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, ChevronDown, LayoutDashboard, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 dark:hover:bg-white/5 border border-black/[0.06] dark:border-white/10 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img
          src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'}
          alt={user.name}
          className="w-7 h-7 rounded-lg object-cover border border-primary/20"
        />
        <span className="hidden lg:block text-xs font-bold text-text-main max-w-[100px] truncate">
          {user.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0A0A0A] border border-black/[0.08] dark:border-white/10 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.05] flex flex-col gap-0.5">
              <span className="text-xs font-bold text-text-main truncate">{user.name}</span>
              <span className="text-[10px] text-text-muted truncate font-medium">{user.email}</span>
            </div>

            {/* Menu Items */}
            <div className="p-1 space-y-0.5">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-main hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-text-muted" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/history"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-main hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <History className="w-4 h-4 text-text-muted" />
                <span>Evaluations</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-main hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-text-muted" />
                <span>Settings</span>
              </Link>
            </div>

            <div className="border-t border-black/[0.05] dark:border-white/[0.05] my-1" />

            {/* Logout Action */}
            <div className="p-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/[0.06] rounded-xl transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
