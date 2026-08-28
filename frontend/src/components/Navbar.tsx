import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Bell, Menu, X, CheckCircle2
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const mockNotifications = [
    { id: 1, title: 'Evaluation Complete', desc: 'Energy Report scored 84% IGBC compliance.', time: '10m ago', type: 'success' },
    { id: 2, title: 'Issue Identified', desc: 'Water Intensity exceeds baseline threshold.', time: '1h ago', type: 'warning' }
  ];

  const navLinks = isAuthenticated
    ? [
      { label: 'GreenIntel AI', path: '/projects' },
      { label: 'Projects', path: '/projects' },
      { label: 'Analytics', path: '/dashboard' },
      { label: 'History', path: '/history' },
      { label: 'Saved Reports', path: '/saved-reports' }
    ]
    : [
      { label: 'GreenIntel AI', path: '/' },
      { label: 'Analytics', path: '/dashboard' }
    ];

  return (
    <header className="sticky top-3 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div className="h-[68px] px-5 rounded-2xl bg-white/85 dark:bg-[#070709]/85 backdrop-blur-2xl border border-black/[0.08] dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/50 flex items-center justify-between transition-all duration-300">

        {/* Left Side: Brand Identity */}
        <Link to={isAuthenticated ? "/projects" : "/"} className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 p-0.5 shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-white">
              <Brain className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-text-main flex items-center gap-2 font-display">
              <span>GreenIntel AI</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span className="text-[9px] font-extrabold bg-primary/10 border border-primary/25 text-primary px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                IGBC
              </span>
            </span>
            <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase">
              Compliance Intelligence
            </span>
          </div>
        </Link>

        {/* Center: Desktop Floating Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] p-1.5 rounded-xl border border-black/[0.04] dark:border-white/10">
          {navLinks.slice(1).map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all duration-200 ${
                  isActive ? 'text-text-main' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-md border border-primary/40 dark:border-primary/30 z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Toolbar controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUnreadCount(0);
              }}
              className="p-2.5 text-text-muted hover:text-text-main bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/10 rounded-xl transition-all cursor-pointer relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-[#070709] animate-pulse" />
              )}
            </button>

            {/* Notification Popover Box */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 p-3 rounded-2xl glass-dropdown-surface text-text-main shadow-2xl z-[100]"
                >
                  <div className="flex items-center justify-between px-2 py-1 border-b border-black/[0.06] dark:border-white/[0.08] pb-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-text-main font-display flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-primary" /> Notifications
                    </span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      Live Stream
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {mockNotifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-text-main leading-tight">{n.title}</h5>
                          <p className="text-[10px] text-text-muted mt-0.5 leading-snug">{n.desc}</p>
                          <span className="text-[9px] text-text-muted/70 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Authentication State & ProfileDropdown */}
          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-text-main border border-black/[0.06] dark:border-white/10 text-xs font-bold rounded-xl transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-emerald-500 hover:from-orange-600 hover:to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text-muted hover:text-text-main bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 rounded-xl cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-2 rounded-2xl glass-dropdown-surface p-4 space-y-3 shadow-2xl z-40"
          >
            <div className="space-y-1">
              {navLinks.slice(1).map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'text-text-main border-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              {isAuthenticated ? (
                <ProfileDropdown />
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-black/[0.04] dark:bg-white/[0.06] text-xs font-bold rounded-xl text-text-main border border-black/[0.06] dark:border-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-primary text-white text-xs font-bold rounded-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

