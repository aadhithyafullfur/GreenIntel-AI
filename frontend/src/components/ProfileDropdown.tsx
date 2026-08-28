import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  FileText,
  History,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
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

  // Extract initials (e.g. "Aadhithya" -> "A", "John Doe" -> "JD")
  const initials = user.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const menuItems = [
    {
      label: 'My Profile',
      description: 'View your account details',
      icon: UserIcon,
      path: '/profile'
    },
    {
      label: 'Saved Reports',
      description: 'Access generated reports',
      icon: FileText,
      path: '/saved-reports'
    },
    {
      label: 'History',
      description: 'View previous evaluations',
      icon: History,
      path: '/history'
    },
    {
      label: 'Settings',
      description: 'Manage platform preferences',
      icon: Settings,
      path: '/profile'
    }
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button: 40px circular container with avatar or fallback initials */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/60 hover:border-primary cursor-pointer focus:outline-none transition-all duration-200 shadow-md shadow-primary/10"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
      >
        {user.avatarUrl && !imgError ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            onError={() => setImgError(true)}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-xs shadow-inner">
            {initials}
          </div>
        )}
        {/* Active Online Status Indicator */}
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-[#070709]" />
      </motion.button>

      {/* Premium Glassy Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-72 rounded-2xl p-3 z-[100] glass-dropdown-surface text-text-main shadow-2xl transition-all duration-200"
          >
            {/* Header: ~64px Avatar, Name, Email centered */}
            <div className="flex flex-col items-center px-4 py-4 text-center border-b border-black/[0.08] dark:border-white/[0.1] mb-2 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl">
              <div className="relative w-16 h-16 rounded-full border-2 border-primary/60 p-0.5 mb-2.5 shadow-md shadow-primary/15">
                {user.avatarUrl && !imgError ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white font-extrabold text-lg shadow-inner">
                    {initials}
                  </div>
                )}
              </div>
              <span className="text-sm font-extrabold text-text-main leading-tight truncate max-w-full tracking-tight">
                {user.name}
              </span>
              <span className="text-xs text-text-muted mt-0.5 truncate max-w-full font-medium">
                {user.email}
              </span>
            </div>

            {/* Structured Menu Options */}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] group-hover:bg-primary/15 text-text-muted group-hover:text-primary transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-text-main leading-none group-hover:text-primary transition-colors">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-text-muted mt-1 truncate">
                          {item.description}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted/60 group-hover:text-primary transition-colors shrink-0 ml-1" />
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-black/[0.08] dark:border-white/[0.1] my-2" />

            {/* Logout Action */}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full group flex items-center justify-between px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/[0.08] rounded-xl transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-none">Logout</span>
                  <span className="text-[10px] text-red-500/70 mt-1">Sign out of your account</span>
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;


