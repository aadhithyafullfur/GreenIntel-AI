import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="bg-card-base/40 dark:bg-white/5 backdrop-blur-xl border border-border-base p-8 rounded-2xl flex flex-col items-center gap-4 max-w-sm w-full text-center shadow-lg orange-glow">
          <Loader />
          <div className="space-y-1 mt-2">
            <h3 className="text-sm font-bold text-text-main">Verifying Credentials</h3>
            <p className="text-[11px] text-text-muted font-sans">Please wait while we establish your secure session.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
