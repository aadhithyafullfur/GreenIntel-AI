import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, User, LogOut, Bookmark, History as HistoryIcon,
  ChevronDown, Activity
} from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import History from './pages/History';
import SavedReports from './pages/SavedReports';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-base bg-grid-pattern text-text-main flex flex-col font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-350">
      
      {/* Top Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-card-base/80 dark:bg-bg-base/80 backdrop-blur-xl border-b border-border-base transition-colors duration-350">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand Group */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Logo Icon Wrapper */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary shadow-sm shadow-primary/20 transition-transform group-hover:scale-[1.02]">
              <Brain className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-text-main flex items-center gap-2">
                <span>GreenIntel AI</span>
                <span className="text-[10px] font-medium bg-primary/10 border border-primary/25 text-primary px-1.5 py-0.5 rounded-md">
                  Enterprise
                </span>
              </span>
              <span className="text-[9px] text-text-muted font-medium tracking-wider uppercase">
                Compliance Intelligence
              </span>
            </div>
          </Link>

          {/* Right Header Controls: Navigation, Badges, ThemeToggle & Auth Status */}
          <div className="flex items-center gap-4">
            
            {/* Standard Public Dashboard Link */}
            <Link 
              to="/" 
              className={`hidden md:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-transparent hover:border-border-base transition-all ${location.pathname === '/' ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Authentication States */}
            <div className="flex items-center gap-2">
              {isAuthenticated && user ? (
                /* Authenticated State: Profile Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 bg-card-base hover:bg-orange-50/15 dark:hover:bg-white/5 border border-border-base rounded-full sm:rounded-lg pr-1.5 sm:pr-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/25"
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-full border border-primary/25 object-cover"
                    />
                    <span className="hidden sm:inline text-xs font-semibold text-text-main truncate max-w-[100px]">
                      {user.name}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-250 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2.5 w-56 bg-white/95 dark:bg-card-base/95 backdrop-blur-xl border border-border-base rounded-xl shadow-xl py-1.5 z-55 divide-y divide-border-base/40 overflow-hidden orange-glow"
                      >
                        {/* User Bio Header */}
                        <div className="px-4 py-2.5 space-y-0.5">
                          <p className="text-xs font-bold text-text-main truncate">{user.name}</p>
                          <p className="text-[10px] text-text-muted truncate font-sans">{user.email}</p>
                        </div>

                        {/* Navigation Options */}
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors ${location.pathname === '/profile' ? 'text-primary bg-primary/5' : 'text-text-main hover:bg-orange-50/20 dark:hover:bg-white/5'}`}
                          >
                            <User className="w-4 h-4 text-text-muted" />
                            <span>My Profile</span>
                          </Link>
                          
                          <Link
                            to="/history"
                            className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors ${location.pathname === '/history' ? 'text-primary bg-primary/5' : 'text-text-main hover:bg-orange-50/20 dark:hover:bg-white/5'}`}
                          >
                            <HistoryIcon className="w-4 h-4 text-text-muted" />
                            <span>Evaluation History</span>
                          </Link>

                          <Link
                            to="/saved-reports"
                            className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors ${location.pathname === '/saved-reports' ? 'text-primary bg-primary/5' : 'text-text-main hover:bg-orange-50/20 dark:hover:bg-white/5'}`}
                          >
                            <Bookmark className="w-4 h-4 text-text-muted" />
                            <span>Saved Reports</span>
                          </Link>
                        </div>

                        {/* Logout Option */}
                        <div className="py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Unauthenticated State: Sign In / Sign Up Buttons */
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card-base hover:bg-orange-50/20 dark:hover:bg-white/5 text-text-main border border-border-base font-semibold text-xs rounded-lg shadow-sm transition-all"
                  >
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-lg shadow-sm shadow-primary/10 hover:shadow-md hover:shadow-primary/15 transition-all"
                  >
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/saved-reports" 
            element={
              <ProtectedRoute>
                <SavedReports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-card-base/40 dark:bg-bg-base/40 border-t border-border-base py-6 text-center transition-colors duration-350">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-xs text-text-muted font-medium">
            © {new Date().getFullYear()} GreenIntel AI. All rights reserved.
          </p>
          <p className="text-[10px] text-text-muted/70 font-normal">
            Designed for Indian Green Building Council (IGBC) taxonomy standards. Compliance Intelligence and Automated Evaluation.
          </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
