import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Bell, Globe, Menu, X, Check
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('EN');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const navLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Evaluations', path: '/history' },
    { label: 'Reports', path: '/saved-reports' },
    { label: 'Analytics', path: '/analytics' }
  ];

  return (
    <header className="sticky top-0 z-50 h-[72px] bg-white/70 dark:bg-black/60 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left Side: Brand Logo Group */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 shadow-sm shadow-primary/20 transition-transform group-hover:scale-[1.02]">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-text-main flex items-center gap-2">
              <span>GreenIntel AI</span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[8.5px] font-extrabold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">
                IGBC
              </span>
            </span>
            <span className="text-[8.5px] text-text-muted font-medium tracking-wider uppercase">
              Compliance Intelligence
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation links with sliding backdrop indicator */}
        <nav className="hidden md:flex items-center gap-1.5 bg-black/[0.03] dark:bg-white/5 p-1 rounded-xl border border-black/[0.02] dark:border-white/5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-1.5 text-xs font-bold rounded-lg transition-colors duration-250 ${
                  isActive ? 'text-text-main' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-black/[0.04] dark:border-white/5 z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Toolbar controls */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 text-text-muted hover:text-text-main bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/10 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            >
              <Globe className="w-4 h-4" />
              <span>{activeLang}</span>
            </button>
            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-1.5 w-28 bg-white dark:bg-[#0A0A0A] border border-black/[0.08] dark:border-white/10 rounded-xl shadow-xl py-1 z-50 overflow-hidden"
                >
                  {['EN', 'HI', 'ES'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setActiveLang(lang);
                        setLangMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-text-main hover:bg-orange-500/[0.04] dark:hover:bg-white/5 text-left cursor-pointer"
                    >
                      <span>{lang === 'EN' ? 'English' : lang === 'HI' ? 'हिंदी' : 'Español'}</span>
                      {activeLang === lang && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications bell */}
          <button
            onClick={() => setNotifications(0)}
            className="p-2 text-text-muted hover:text-text-main bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/10 rounded-xl transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-black" />
            )}
          </button>

          {/* Theme Toggle icon */}
          <ThemeToggle />

          {/* Separator line */}
          <div className="w-[1px] h-6 bg-black/[0.06] dark:bg-white/15 mx-1" />

          {/* Authentication State button & ProfileDropdown */}
          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-text-main border border-black/[0.06] dark:border-white/10 text-xs font-bold rounded-xl transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/10 hover:shadow-lg transition-all"
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
            className="p-2 text-text-muted hover:text-text-main bg-neutral-100 dark:bg-white/5 border border-black/[0.06] dark:border-white/10 rounded-xl cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
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
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden absolute top-[72px] left-0 right-0 bg-white dark:bg-[#0A0A0A] border-b border-black/[0.06] dark:border-white/10 px-4 py-6 space-y-4 shadow-xl z-40 overflow-hidden"
          >
            <div className="space-y-1.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      isActive
                        ? 'bg-primary/5 text-primary border-primary/20'
                        : 'text-text-main border-transparent hover:bg-neutral-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-4">
              <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Account Action</span>
              {isAuthenticated ? (
                <ProfileDropdown />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-1.5 bg-neutral-100 dark:bg-white/5 border border-black/[0.06] dark:border-white/10 text-xs font-bold rounded-xl text-text-main"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl"
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
