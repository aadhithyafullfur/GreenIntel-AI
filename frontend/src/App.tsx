import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import History from './pages/History';
import SavedReports from './pages/SavedReports';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-base bg-grid-pattern text-text-main flex flex-col font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-350">

      {/* Top Sticky Navigation */}
      <Navbar />

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
