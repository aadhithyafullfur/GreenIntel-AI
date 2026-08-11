import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  FileText,
  History,
  Settings,
  LogOut
} from 'lucide-react';
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
      {/* Trigger Button: 40px circular image with scale, orange border, and online indicator */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary cursor-pointer focus:outline-none transition-all duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const initials = encodeURIComponent(
              user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()
            );
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${initials}&background=F97316&color=fff&size=128&bold=true`;
          }}
        />
        {/* Active Online Indicator */}
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#050505]" />
      </motion.button>

      {/* Premium Glass Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-64 rounded-2xl p-2 z-[100] bg-card-base border border-border-base text-text-main shadow-2xl backdrop-blur-xl transition-all duration-300"
          >
            {/* Header: Large profile picture, Name, Email */}
            <div className="flex flex-col items-center px-4 py-4 text-center border-b border-black/[0.05] dark:border-white/[0.05] mb-1">
              <div className="relative w-14 h-14 rounded-full border-2 border-primary/45 p-0.5 mb-2.5 shadow-sm">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-text-main leading-tight truncate max-w-full">
                {user.name}
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 truncate max-w-full font-medium">
                {user.email}
              </span>
            </div>

            {/* Menu Options */}
            <div className="space-y-0.5">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-text-main hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-text-muted" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/saved-reports"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-text-main hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-text-muted" />
                <span>Saved Reports</span>
              </Link>

              <Link
                to="/history"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-text-main hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <History className="w-4 h-4 text-text-muted" />
                <span>History</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-text-main hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-text-muted" />
                <span>Settings</span>
              </Link>
            </div>

            <div className="border-t border-black/[0.05] dark:border-white/[0.05] my-1" />

            {/* Logout Action */}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/[0.06] rounded-xl transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
